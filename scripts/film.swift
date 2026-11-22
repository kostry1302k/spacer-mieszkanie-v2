// Składa klatki z app.film() w wideo MP4 (H.264) – bez ffmpeg, na wbudowanym w macOS AVFoundation.
// swift scripts/film.swift <wyjście.mp4> <lista.txt> [szerokość=1280] [wysokość=720] [fps=30] [bitrate=4000000]
// lista.txt: jedna klatka w wierszu – `ścieżka.jpg` albo przejście kurtynką `stara.jpg|nowa.jpg|0.42`
// (nowa klatka odsłania się od lewej do 42% szerokości, na granicy cienka jasna linia).
import AVFoundation
import CoreGraphics
import Foundation
import ImageIO

let args = CommandLine.arguments
guard args.count >= 3 else { print("użycie: swift scripts/film.swift wyjście.mp4 lista.txt [w h fps bitrate]"); exit(1) }
let out = URL(fileURLWithPath: args[1])
let lines = try! String(contentsOfFile: args[2], encoding: .utf8).split(separator: "\n").map(String.init).filter { !$0.isEmpty }
let width = args.count > 3 ? Int(args[3])! : 1280
let height = args.count > 4 ? Int(args[4])! : 720
let fps = args.count > 5 ? Int32(args[5])! : 30
let bitrate = args.count > 6 ? Int(args[6])! : 4_000_000

try? FileManager.default.removeItem(at: out)
let writer = try! AVAssetWriter(outputURL: out, fileType: .mp4)
let input = AVAssetWriterInput(mediaType: .video, outputSettings: [
  AVVideoCodecKey: AVVideoCodecType.h264,
  AVVideoWidthKey: width,
  AVVideoHeightKey: height,
  AVVideoCompressionPropertiesKey: [
    AVVideoAverageBitRateKey: bitrate,
    AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
    AVVideoMaxKeyFrameIntervalKey: Int(fps) * 2,
  ],
])
input.expectsMediaDataInRealTime = false
let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: [
  kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
  kCVPixelBufferWidthKey as String: width,
  kCVPixelBufferHeightKey as String: height,
])
writer.add(input)
writer.startWriting()
writer.startSession(atSourceTime: .zero)

var cache: [String: CGImage] = [:]
func image(_ path: String) -> CGImage {
  if let hit = cache[path] { return hit }
  guard let src = CGImageSourceCreateWithURL(URL(fileURLWithPath: path) as CFURL, nil),
        let img = CGImageSourceCreateImageAtIndex(src, 0, nil) else { fatalError("brak klatki: \(path)") }
  if cache.count > 8 { cache.removeAll() }
  cache[path] = img
  return img
}

let full = CGRect(x: 0, y: 0, width: width, height: height)
for (i, line) in lines.enumerated() {
  while !input.isReadyForMoreMediaData { usleep(2000) }
  var buffer: CVPixelBuffer?
  CVPixelBufferPoolCreatePixelBuffer(nil, adaptor.pixelBufferPool!, &buffer)
  let pb = buffer!
  CVPixelBufferLockBaseAddress(pb, [])
  let ctx = CGContext(data: CVPixelBufferGetBaseAddress(pb), width: width, height: height, bitsPerComponent: 8,
                      bytesPerRow: CVPixelBufferGetBytesPerRow(pb), space: CGColorSpaceCreateDeviceRGB(),
                      bitmapInfo: CGImageAlphaInfo.premultipliedFirst.rawValue | CGBitmapInfo.byteOrder32Little.rawValue)!
  ctx.interpolationQuality = .high
  let parts = line.split(separator: "|").map(String.init)
  ctx.draw(image(parts[0]), in: full)
  if parts.count == 3, let x = Double(parts[2]), x > 0 {
    let edge = CGFloat(x) * CGFloat(width)
    ctx.saveGState()
    ctx.clip(to: CGRect(x: 0, y: 0, width: edge, height: CGFloat(height)))
    ctx.draw(image(parts[1]), in: full)
    ctx.restoreGState()
    if x < 1 {
      ctx.setFillColor(CGColor(red: 1, green: 0.97, blue: 0.92, alpha: 0.9))
      ctx.fill(CGRect(x: edge - 1.5, y: 0, width: 3, height: CGFloat(height)))
    }
  }
  CVPixelBufferUnlockBaseAddress(pb, [])
  adaptor.append(pb, withPresentationTime: CMTime(value: CMTimeValue(i), timescale: fps))
}
input.markAsFinished()
let done = DispatchSemaphore(value: 0)
writer.finishWriting { done.signal() }
done.wait()
if writer.status != .completed { print("błąd: \(String(describing: writer.error))"); exit(1) }
print("\(out.lastPathComponent): \(lines.count) klatek, \(width)×\(height), \(fps) fps")
