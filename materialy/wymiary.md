# Mieszkanie 21 (Osiedle Sfera II, ul. Oleńki 14, klatka A, piętro 1) – wymiary wstępne

Źródła: `rzuty/karta-1.21.pdf` (inwentaryzacja geodety, PN-ISO 9836, 20.10.2025 – pola pomieszczeń), `rzuty/rzut-1.21.png` (rzut sprzedażowy 1:100 z meblami).
Powierzchnia użytkowa 67,24 m² + balkon 5,15 m² (karta; rzut sprzedażowy podaje 5,21 m²).

## Metoda (wymiary wyłącznie z pól)
Karta nie ma wymiarów, tylko pola. Z wektorowego rysunku karty zmierzono w pikselach odległości między wewnętrznymi licami ścian
(proporcje i położenie ścian), a skalę wyznaczono **wyłącznie z pól pomieszczeń**: jedna skala dla całego rysunku, dopasowana metodą
najmniejszych kwadratów do sześciu pól z karty (w łazience i WC odjęte szachty – pola z karty ich nie obejmują).

- Skala: **0,5739 cm/px** (render 6 px/pt).
- Kontrola – pole z wymiarów vs karta: hol −1,0%, łazienka −1,0%, pokój dzienny +0,2%, pokój 4 −0,4%, pokój 5 −0,1%, WC −1,4%.
- Dokładność: ok. ±1 cm na krawędź (1–2 px). Niezależny test: podziałka 1:100 na rzucie sprzedażowym daje szerokość pokoju dziennego ok. 329 cm (tu 327,7).

## Pomieszczenia (w świetle tynku, cm)
| Nr | Pomieszczenie | Wymiary | Pole z wymiarów | Karta |
|---|---|---|---|---|
| 1.21.1 | Hol | 697,3 × 123,4 | 8,60 | 8,69 |
| 1.21.2 | Łazienka | 285,8 × 160,1, minus szacht 43,0 × 67,1 | 4,29 | 4,33 |
| 1.21.3 | Pokój dzienny z aneksem | 327,7 × 870,6 | 28,53 | 28,48 |
| 1.21.4 | Pokój | 255,4 × 338,0 | 8,63 | 8,67 |
| 1.21.5 | Pokój | 421,8 × 338,0 | 14,26 | 14,27 |
| 1.21.6 | WC | 186,0 × 160,1, minus szacht 35,0 × 62,0 | 2,76 | 2,80 |

## Ścianki działowe (grubość z tej samej skali)
- pokój 4 | pokój 5: ok. 9 cm; pokoje 4 i 5 | hol: ok. 9 cm,
- hol | łazienka i WC: ok. 13 cm; łazienka | WC: ok. 11 cm,
- pokój dzienny | hol: ok. 12 cm; pokój dzienny | łazienka: ok. 12 cm.
(Prawdopodobnie typowe 10 / 12 cm – do potwierdzenia.)

## Układ współrzędnych (do modelu 3D)
Patrzymy na rzut jak na karcie. Początek (0, 0): wewnętrzny narożnik pokoju dziennego przy jego górnej (krótszej) ścianie i ścianie lewej.
X w prawo, Y w dół (w stronę balkonu). Lica ścian w cm:
- Pokój dzienny 1.21.3: X 0–327,7, Y 0–870,6 (balkon za dolną ścianą).
- Hol 1.21.1: X 338,6–1035,9, Y 0–123,4.
- Pokój 1.21.4: X 349,5–604,9, Y −347,2 – −9,2.
- Pokój 1.21.5: X 614,1–1035,9, Y −347,2 – −9,2.
- Łazienka 1.21.2: X 339,2–625,0, Y 136,0–296,1; szacht w lewym dolnym narożniku X 339,2–382,2, Y 228,4–296,1.
- WC 1.21.6: X 635,9–821,8, Y 136,0–296,1; szacht w lewym dolnym narożniku X 635,9–670,9, Y 233,6–296,1.

## Jeszcze niezmierzone (następny krok)
Otwory drzwiowe i okienne (położenie, szerokość), drzwi balkonowe, balkon, grubość ścian zewnętrznych i międzylokalowych.
