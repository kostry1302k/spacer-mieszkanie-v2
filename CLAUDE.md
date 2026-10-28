# Wirtualny spacer – Mieszkanie M21, Osiedle Sfera II

Statyczna strona z wirtualnym spacerem po mieszkaniu 67,24 m² (ul. Oleńki 14, kl. A, 1. piętro z 3): hol, pokój dzienny z aneksem,
gabinet (pokój 4), sypialnia (pokój 5), łazienka, WC, balkon 5,15 m². Widok z perspektywy człowieka, trzy tryby: stan surowy
i dwa warianty wykończenia „Orzech, trawertyn i zieleń” (styl 1, styl 2). Silnik skopiowany ze spaceru M12 (repo `spacer-mieszkanie-v1`); PLAN.md opisuje etapy M12.

## Źródła prawdy
1. [mieszkania/m21/wymiary.md](mieszkania/m21/wymiary.md) – **jedyne źródło wymiarów**. Wymiary policzone wyłącznie z pól pomieszczeń z karty geodety (opis metody w pliku).
2. `materialy/m21/rzuty/karta-1.21.pdf` (karta lokalu, pola) i `rzut-1.21.png` (rzut sprzedażowy 1:100) – tylko odniesienie.
3. `materialy/m21/style/styl-1/` i `styl-2/` – moodboardy (PDF, 7 plansz, ta sama nazwa pliku, inna treść) + zdjęcia inspiracji.

`materialy/<id>/` jest tylko do odczytu i nie trafia do repozytorium (repo publiczne). wymiary.md zmieniamy wyłącznie po decyzji właściciela.

## Najważniejsze decyzje (26.10.2026)
- Wysokość 270. Okna pokoi 4, 5 i pokoju dziennego na **północ** (dziedziniec), balkon na **południe** (+Y).
- Bez zmian ścian – jeden wariant (deweloperski) w obu trybach.
- Grubości ścian typowe (zewnętrzne 40 / balkonowa 30 / międzylokalowe 20 / wejściowa 25), grzejniki i elektryka orientacyjne.
- Hol → pokój dzienny: **otwarte przejście bez drzwi** (decyzja właściciela). Drzwi łazienki i WC otwierają się do holu, jak w karcie – otwarte zasłaniają przejście holem.
- Hosting: GitHub Pages przez GitHub Actions, build z `base: './'`.

## Stos technologiczny
- **Vite** + **TypeScript** (strict), moduły ES, bez frameworka UI (HUD w czystym DOM + CSS).
- **Three.js** (wersja przypięta w package.json), dodatki z `three/addons`: `GLTFLoader`, `KTX2Loader`, `DRACOLoader`/meshopt, `RGBELoader`, `PointerLockControls` (lub własna implementacja).
- Brak silnika fizyki: kolizje 2D (gracz to okrąg r = 25 cm, ściany to odcinki/prostokąty z danych).
- Zasoby: `npm run assets` (scripts/fetch-assets.ts) pobiera tekstury i HDRI przez API Poly Haven / ambientCG, przeskalowuje i kompresuje JPEG narzędziem `sips` (macOS), rozpakowuje `unzip`. Wynik jest w repozytorium, CI go nie pobiera. Modele GLB (Etap 6+): `@gltf-transform/cli`.
- Renderowanie: tone mapping AgX, światła fizyczne (cd, lx, nit), niebo HDRI `noon_grass` jako tło i mapa otoczenia.

## Struktura plików
```
CLAUDE.md, PLAN.md
index.html                 – szkielet strony, kontener canvas + HUD
vite.config.ts             – base './', podział chunków, alias `@mieszkanie` → mieszkania/<MIESZKANIE, domyślnie m21>
package.json
.github/workflows/deploy.yml – build i publikacja na GitHub Pages
mieszkania/<id>/           – DANE mieszkania (wszystko, co nie jest silnikiem):
  index.ts                 – `site`: podpis, rzut, lista trybów (rawMode + finishMode dla każdego stylu)
  apartment.ts             – JEDYNY plik geometrii: ściany, otwory, drzwi, okna, szachty, pokoje, balkon, grzejniki, elektryka
  style/styl1.ts, styl2.ts – materiały, paleta mebli i lista mebli (typ, środek obrysu w cm, kierunek frontu, parametry);
                             styl 2 dziedziczy styl 1 i podmienia wybrane meble (zbiór REPLACED)
  wymiary.md               – wymiary i decyzje dla tego mieszkania
materialy/<id>/            – rzuty, moodboardy, zdjęcia (tylko lokalnie, poza git)
public/assets/
  textures/<id>/<1k|2k>/   – tekstury PBR CC0: color.jpg, normal.jpg (OpenGL), roughness.jpg
  models/<id>.glb          – meble GLB (skompresowane)
  hdri/<id>_<1k|2k>.hdr    – niebo/otoczenie (telefon 1k, komputer 2k)
  CREDITS.md               – źródło, autor, licencja każdego zasobu (generuje `npm run assets`)
scripts/
  fetch-assets.ts          – pobiera zasoby z listy (Poly Haven API / ambientCG), konwertuje, zapisuje CREDITS
  check-data.ts            – walidacja danych mieszkania MIESZKANIE (zamknięte obrysy, otwory w ścianach, metraże vs wymiary.md)
src/                       – SILNIK: bez danych i nazw konkretnego mieszkania
  main.ts                  – start aplikacji, spina moduły
  site.ts                  – jedyny punkt styku z danymi (`@mieszkanie`): rzut, tryby, podpis
  core/
    units.ts               – cm → m (dane w cm, scena w metrach: 1 jednostka = 1 m)
    plan.ts                – obliczenia na rzucie: pole i środek wielokąta, oś ściany, filtr wariantu (bez zależności, używa go też check-data)
    state.ts               – stan aplikacji (tryb, widok, pora dnia, nowa ścianka, opcje makiety) i prosty magazyn z subskrypcją
    quality.ts             – profil jakości (mobile/desktop) i automatyczne obniżanie (DPR, potem cienie) przy FPS < 30
    assets.ts              – materiały trybów ładowane przy pierwszym użyciu, wspólne tekstury, zwalnianie pamięci GPU po zmianie trybu
    debug.ts               – tryb `?debug` w adresie: licznik FPS; w konsoli `app.walk(...)`, `app.pick()` do testów
  data/
    types.ts               – typy danych (Wall, Opening, Door, Room, Fixture…)
    modes/
      index.ts             – typ trybu, `rawMode` (stan surowy, wspólny) i `finishMode` (styl na wspólnej palecie mebli)
      common.ts            – powierzchnie wspólne dla trybów (stolarka, elewacja, grzejniki, osprzęt)
      raw.ts               – tryb surowy: wylewka, szary tynk, gołe żarówki
    materials.ts           – katalog tekstur PBR (id, rzeczywisty rozmiar kafla w m, dostępne rozdzielczości) i HDRI nieba
  geometry/
    apartmentModel.ts      – składa całą bryłę mieszkania z danych dla wariantu i zestawu materiałów
    box.ts                 – prostopadłościany w cm rzutu, UV w skali świata, łączenie geometrii
    walls.ts               – ściany z otworami (bryły między otworami), lica przypisane do pomieszczeń (łazienka → płytki, zewnątrz → elewacja)
    floors.ts              – podłogi i sufity z obrysów pokoi, listwy
    openings.ts            – ościeżnice, skrzydła drzwi, drzwi balkonowe ze szkłem
    balcony.ts             – płyta, balustrada B1
    fixtures.ts            – grzejniki i osprzęt elektryczny (orientacyjny)
  furniture/
    types.ts               – kontrakt buildera: części (geometria w cm + nazwa materiału), obrys, światła, modele GLB
    parts.ts               – bryły pomocnicze (zaokrąglone pudełka, walce, pierścienie, fałdy zasłon)
    builders/              – meble proceduralne: living (sofa, stoły, łóżko, szafki…), kitchen, bathroom, lighting, decor
    place.ts               – rozmieszcza meble z danych trybu, łączy bryły w jedną siatkę na materiał, zbiera kolizje i lampy
    gltf.ts                – modele GLB (Meshopt + WebP) przeskalowane do zadanej wysokości
  scene/
    renderer.ts            – WebGLRenderer, tone mapping (ACES/AgX), sRGB, resize, DPR
    materials.ts           – klucze powierzchni (SurfaceKey) i tworzenie zestawu materiałów trybu
    views.ts               – widoki makiety: kamera orbitalna 3D i rzut z góry
    postfx.ts              – efekty obrazu w spacerze, tylko komputer: cienie kontaktowe GTAO (pół rozdzielczości); `app.postfx` w ?debug; wyłączane jako pierwsze przy spadku FPS
    lighting.ts            – niebo HDRI, słońce z południa z cieniem, światło nieba w przeszkleniach (RectAreaLight), żarówki wieczorem; presety dzień/wieczór
    environment.ts         – otoczenie widoczne w spacerze: elewacja, balkony wyższych pięter, trawa (dalej niebo HDRI)
  controls/
    player.ts              – pozycja, prędkość, wysokość oczu 165 cm
    desktop.ts             – pointer lock, WASD/strzałki, Shift = szybciej
    touch.ts               – joystick pod lewym kciukiem (lewa dolna część ekranu), przeciąganie = rozglądanie, dotknięcie = drzwi
    collisions.ts          – kolizje okrąg–odcinki z danych, uwzględnia stan drzwi
  interaction/
    doors.ts               – raycast/celownik, otwieranie drzwi (E/klik/tap), animacja skrzydła
  ui/
    hud.ts                 – HUD spaceru: celownik, podpowiedź, ekran startowy/pauzy, przyciemnienie przy przejściu
    modeSwitch.ts          – przełącznik trybów i ścianki
    minimap.ts             – minimapa 2D (canvas) rysowana z apartment.ts + pozycja i kierunek patrzenia
    roomList.ts            – lista pokoi, teleport do punktu startowego pokoju
    viewPanel.ts           – panel widoku: Spacer / Makieta / Z góry, dzień / wieczór, nowa ścianka, sufit, etykiety
    roomLabels.ts          – podpisy pokoi z metrażem (CSS2D)
  styles/main.css
```

## Zasady pracy
- **Silnik (`src/`) nie zna żadnego mieszkania** – dane trafiają do niego wyłącznie przez `src/site.ts`. Nowe mieszkanie = nowy folder `mieszkania/<id>/`, a `MIESZKANIE=<id> npm run dev|build` wybiera, które budujemy.
- **Geometria tylko z `mieszkania/<id>/apartment.ts`.** Żadnych liczb wymiarowych w modułach geometrii, sterowania czy minimapy. Dane w cm, dokładnie jak w wymiary.md (te same nazwy i współrzędne), konwersja na metry w jednym miejscu (`core/units.ts`).
- Zmiana wymiaru: najpierw wymiary.md (za zgodą właściciela), potem apartment.ts, potem `npm run check:data`.
- Układ współrzędnych jak w wymiary.md: X w prawo, Y w głąb (→ w Three.js oś Z), wysokość → oś Y Three.js. Początek w lewym górnym narożniku pokoju dziennego.
- Ściany zewnętrzne i międzylokalowe modelujemy z prawdziwą grubością, żeby ościeża i wnęki okien wyglądały wiarygodnie.
- Tryby różnią się tylko danymi (`mieszkania/<id>/style/*`); kod budujący scenę jest wspólny. Materiał lica ściany i podłogi wynika z rodzaju pomieszczenia (`Room.kind`), np. łazienka → `wallBathroom` / `floorBathroom`. Przełączenie trybu nie przeładowuje strony, zasoby trybu ładujemy przy pierwszym użyciu.
- **Zasoby tylko CC0**: Poly Haven (tekstury, HDRI, modele), ambientCG (tekstury). Każdy plik wpisany do `public/assets/CREDITS.md` (URL, autor, licencja). Nie dodawać zasobów bez licencji ani z „free for personal use”.
- Meble to dane (`FurnitureItem` w `mieszkania/<id>/style/styl*.ts`), nie kod: przy rozstawianiu pilnuj pola skrzydeł drzwi (balkonowe X 122–306 do Y ≈ 770, pokoje 4 i 5, łazienka i WC do holu) i przejść ≥ 45 cm (gracz ma promień 22 cm). Trasy sprawdzaj w konsoli `?debug` (`app.walk`).
- Ceramika i armatura mają dokładne kształty z `furniture/parts.ts`: `basin` (misa od środka – zlew, wanna), `plate` (blat z otworem), `lathe` (umywalka toczona), `tube` (wylewki baterii). Lustra zwracają `mirrors` – w `place.ts` to `Reflector` z prawdziwym odbiciem (512 px, na telefonie 256), odświeżany tylko gdy lustro jest bliżej niż 6 m i widać je zza ścian. Czas klatki: `app.bench(20)` w `?debug`.
- **Wypalone światło (test, 28.10.2026):** w `?debug` `await app.exportBake('day')` zapisuje scenę trybu do `bake-work/` (poza git), potem `npm run bake -- --scene bake-work/styl1.glb --lights bake-work/styl1-day.json --out public/bake/m21/styl1-day --size 2048 --samples 256` (Blender 5.2, Cycles na Metal, ~1,5 min). Wynik: geometria z drugim UV + lightmapa RGBM (`.png`) + `.json` (scale, exposure, ambient) i spis `index.json`; na czas testów spacer używa jej tylko z `?bake` w adresie (domyślnie światło na żywo). `--preview --camera x,y,z,kąt` renderuje widok z Blendera do porównań. Każda zmiana mebli/kolorów stylu wymaga ponownego eksportu i wypalenia.
- Lampy są meblami (builder zwraca `lights`); źródła `alwaysOn` świecą też w dzień (łazienka bez okna). Na telefonie ograniczamy liczbę lamp: taśmy LED świecą tylko materiałem, bez osobnego źródła.
- Gdy nie ma pasującego modelu CC0, mebel modelujemy proceduralnie w `furniture/builders`: zaokrąglone krawędzie (RoundedBoxGeometry/fazki), poprawne proporcje z katalogów (sofa 85 cm wys., siedzisko 45, blat 90, stół 75 itd.), osobne materiały dla tkaniny, drewna, metalu.
- **Budżet wydajności (telefon średniej klasy):** ≥ 30 fps, cel 60 fps na komputerze; ≤ 150 draw calls; ≤ 300 tys. trójkątów; tekstury JPEG 1k na telefonie (2k tylko dla podłóg na komputerze; KTX2 rozważymy w Etapie 8, jeśli zabraknie pamięci GPU); pierwszy tryb do pobrania ≤ 20 MB; DPR na telefonie ≤ 1,5; jeden cień kierunkowy (mapa 1024 mobile / 2048 desktop), światła sztuczne bez cieni lub z najwyżej 1–2 cieniami na desktopie. Statyczne bryły łączymy (merge) per materiał.
- Kod i identyfikatory po angielsku, interfejs i dokumentacja po polsku. Komentarze oszczędnie, tam gdzie logika nie jest oczywista.
- Każdy etap z PLAN.md kończy się działającą wersją: `npm run build` bez błędów, sprawdzenie w podglądzie (desktop i widok mobilny), commit, publikacja na GitHub Pages.
- Commity małe, opisowe, po polsku lub angielsku konsekwentnie w obrębie repo (domyślnie: polski).

## Polecenia
```bash
npm run dev          # serwer deweloperski (z --host, żeby sprawdzić na telefonie w tej samej sieci)
npm run build        # build do dist/
npm run preview      # podgląd builda
npm run check:data   # walidacja mieszkania/<MIESZKANIE>/apartment.ts
npm run assets       # pobranie i konwersja zasobów CC0 (tylko macOS – używa sips)
```

## Styl „Orzech, trawertyn i zieleń”
**Źródło: moodboard PDF (wyżej).** Dane w `mieszkania/m21/style/styl1.ts`.
- **Paleta:** wapno #EEE7DC (ściany, sufity), trawertyn #D8C8AF (blaty, stoliki, pas za łóżkiem), len i bouclé #E6DCCB (tkaniny), orzech #5E3B26 (kuchnia do sufitu, ściana TV, boiserie, szafy), dąb w jodełkę #9A7353 wszędzie bez progów, butelkowa zieleń #2F4A3A (glazura 7,5 × 30 – plecy kuchni, ściana WC), glina #C9978A (ryflowane płytki w łazience), lastryko w łazience i WC, mosiądz szczotkowany; czerń tylko w cienkich liniach i kopule nad stołem.
- **Pokój dzienny:** kuchnia na prawej ścianie (słupek z lodówką, blat 275, góra orzech do sufitu), półwysep 150 × 60 z 2 hokerami, ściana TV z orzecha z podświetlaną niszą, szafka RTV 150 lewitująca 15 cm, sofa bouclé 240, stolik ø 90, stół ø 100 z 3 krzesłami, czarna kopuła, komoda 180 × 40, juta, lniane zasłony.
- **Sypialnia:** łóżko 160 × 200 przy prawej ścianie, boiserie z orzecha h 105 + pas trawertynu + ryflowane panele do sufitu, mosiężne kinkiety, ławka, szafa 230 × 60 z frezowanymi frontami, fotel bouclé ze stolikiem.
- **Gabinet:** biurko 140 × 60 pod ścianą w kolorze trawertynu, 3 półki z LED, sofa dzienna 90 × 190, szafa 122 × 65, roleta lniana.
- **Hol:** szafa z orzecha do sufitu na końcu, wisząca konsola z lustrem, półki na obrazy, profil LED, chodnik z juty.
- **Łazienka:** wanna 160 × 70 z szybą, glina do 120 (nad wanną do sufitu), blat z trawertynu nad pralką, umywalka nablatowa, mosiężna armatura; **WC:** zielona glazura na ścianie z umywalką.
- **Odstępstwa:** szafka RTV 150 zamiast 220 (skrzydło prawych drzwi balkonowych parkuje przy ścianie TV od Y ≈ 770), lustro w holu prostokątne zamiast łukowego, lampa łukowa zastąpiona stojącą z abażurem, „oliwka” to model rośliny CC0.

## Styl 2 – „Orzech, trawertyn i zieleń”, wariant 2
**Źródło: `materialy/m21/style/styl-2/…pdf`.** Dane w `mieszkania/m21/style/styl2.ts`; paleta, kuchnia, hol, ściana za łóżkiem, łazienka i WC jak w stylu 1.
- **Podłoga:** gres ośmiokątny 20 × 20 w odcieniu trawertynu z zieloną kostką w holu i pasie kuchni (X 179–327,7, Y 0–460,6), mosiężna listwa na granicy z jodełką (`TilesSpec.dots`).
- **Pokój dzienny:** stół orzech 180 × 90, tapicerowana ławka pod lewą ścianą + 3 krzesła bouclé, dwie czarne kopuły; narożnik bouclé 270 z szezlongiem od strony kuchni; ściana TV: tapeta z trawy morskiej + panel z orzecha 180 na całą wysokość z TV; jasna kopuła nad półwyspem.
- **Sypialnia:** szafa przesuwna 292 × 65 naprzeciw łóżka (Y −315…−23), środkowe drzwi odsunięte, za nimi TV 43″.
- **Gabinet:** grafitowa ściana, biurko 230 × 60, panel orzech z LED, podświetlane witryny, grafitowe szafki do sufitu, kontener, pegboard, ciemny dywan; leżanka 90 × 200 z drewnianą ramą.
- **Łazienka:** wanna w obudowie z ryflowanych płytek.
- **Odstępstwa:** szafka RTV 160 zamiast 220 (skrzydło prawych drzwi balkonowych); szezlong 60 cm i narożnik przesunięty 16 cm w stronę balkonu (inaczej przejście przy półwyspie < 44 cm); szafa w sypialni odsunięta od okna (32 cm), więc TV jest 14 cm od osi łóżka.

### Stan surowy
Wylewka, szary tynk, gołe żarówki na wypustach, grzejniki płytowe, stolarka antracyt, brak drzwi wewnętrznych i mebli.
