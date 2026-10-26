# Plan prac – wirtualny spacer M12

Każdy etap kończy się wersją, którą da się otworzyć w przeglądarce: `npm run build` bez błędów, sprawdzenie na komputerze i w widoku mobilnym, commit, publikacja na GitHub Pages. Zasady i struktura plików: [CLAUDE.md](CLAUDE.md). Wymiary: [materialy/wymiary.md](materialy/wymiary.md).

---

## Etap 0 – Szkielet i publikacja
**Cel:** pusty projekt, który buduje się i publikuje.
- `git init`, `.gitignore` (node_modules, dist, .DS_Store), Vite + TypeScript (strict) + Three.js.
- `vite.config.ts` z `base: './'`, struktura katalogów z CLAUDE.md (puste moduły tylko tam, gdzie od razu są potrzebne).
- `renderer.ts`: canvas na cały ekran, resize, DPR z limitem, tone mapping, sRGB; testowa scena (podłoga + sześcian + kamera orbitalna).
- GitHub Actions: build i publikacja na GitHub Pages (po utworzeniu repozytorium przez właściciela).
- Licznik FPS w trybie deweloperskim (`?debug`).

**Gotowe, gdy:** strona otwiera się lokalnie i pod adresem GitHub Pages, również na telefonie.

---

## Etap 1 – Dane mieszkania i bryła stanu surowego
**Cel:** dokładny model 3D z jednego pliku danych, oglądany z góry.
- `data/types.ts` i `data/apartment.ts`: obrys, ściany (z grubością i typem: sąsiednia 21, zewnętrzna 39,5, działowe 10/8, szachty), otwory (drzwi wejściowe, łazienka, balkonowe; wariant przebudowy: ścianki i drzwi sypialni), pokoje (obrysy, nazwy, punkty startowe), wysokość 270, balkon, grzejniki, elektryka `orientacyjna`.
- `scripts/check-data.ts`: zamknięte obrysy, otwory mieszczą się w ścianach, brak nakładania ścian, metraże pokoi zgodne z wymiary.md (±0,05 m²): hol 3,51, łazienka 3,14, pokój 23,47, sypialnia 9,19, salon po przebudowie ≈13,82, balkon 5,76.
- `geometry/walls.ts`, `floors.ts`, `openings.ts`, `balcony.ts`: ściany z wycięciami, ościeża, nadproża, podłoga i sufit, płyta balkonu z balustradą, prosta stolarka drzwi.
- Materiały płaskie (jednolite kolory), światło tymczasowe.
- Widok „makieta”: kamera orbitalna nad mieszkaniem bez sufitu, przełącznik nowej ścianki (wstępny, w panelu debug).

**Gotowe, gdy:** `check:data` przechodzi, model z góry zgadza się z rzutem wykonawczym (porównanie widoku „Z góry” ze zrzutem rzutu; rzutów nie publikujemy, bo repozytorium jest publiczne), przełącznik pokazuje i ukrywa ściankę.

---

## Etap 2 – Spacer na komputerze
**Cel:** chodzenie po mieszkaniu z perspektywy człowieka.
- `controls/player.ts`, `desktop.ts`: pointer lock, WASD + mysz, Shift = szybciej, oczy na 165 cm, płynne przyspieszanie i hamowanie.
- `collisions.ts`: okrąg r = 25 cm kontra ściany z danych; ślizganie wzdłuż ścian; zamknięte drzwi blokują, otwarte nie; balkon dostępny przez otwarte skrzydło, balustrada blokuje.
- `interaction/doors.ts`: celownik, podpowiedź „E – otwórz”, animacja skrzydła wokół zawiasów z danych (kierunek otwierania jak w wymiary.md).
- `ui/minimap.ts`: rzut 2D rysowany z apartment.ts, pozycja i stożek widzenia, podpisane pokoje.
- `ui/roomList.ts`: lista pokoi, kliknięcie przenosi do punktu startowego pokoju (płynne przejście lub szybkie przyciemnienie).
- Ekran startowy z instrukcją sterowania.

**Gotowe, gdy:** da się przejść po wszystkich pomieszczeniach i wyjść na balkon, nie da się przejść przez ścianę ani zamknięte drzwi, minimapa i lista pokoi działają.

---

## Etap 3 – Spacer na telefonie
**Cel:** to samo na ekranie dotykowym.
- `controls/touch.ts`: joystick w lewej dolnej części ekranu, przeciąganie po reszcie ekranu do rozglądania, dotknięcie drzwi = otwórz/zamknij.
- Responsywny HUD: zwijana minimapa i lista pokoi, duże przyciski, bezpieczne marginesy (notch), blokada przewijania i zoomu strony.
- `core/quality.ts`: profil mobilny (DPR ≤ 1,5, mniejsza mapa cieni, tekstury 1k), automatyczne obniżenie jakości przy niskim FPS.
- Test: Safari iOS i Chrome Android (przez `npm run dev -- --host` i GitHub Pages), orientacja pionowa i pozioma.

**Gotowe, gdy:** spacer jest płynny (≥ 30 fps) na telefonie średniej klasy na płaskich materiałach, sterowanie nie koliduje z gestami przeglądarki.

---

## Etap 4 – Realistyczny stan surowy
**Cel:** pierwszy tryb w jakości docelowej, razem z potokiem zasobów i oświetleniem.
- `scripts/fetch-assets.ts` + `public/assets/CREDITS.md`: pobranie tekstur CC0 (wylewka, szary tynk, beton, metal, szkło) i HDRI nieba z Poly Haven / ambientCG, konwersja do KTX2 (1k/2k), zapis licencji.
- `data/materials.ts`, `data/modes/raw.ts`: materiały PBR (albedo, normal, roughness, AO), skala UV w metrach, żeby faktury miały realny rozmiar.
- Osprzęt orientacyjny: puszki, gniazdka, włączniki, wypusty z kablami, skrzynka w holu, domofon, grzejniki płytowe przy drzwiach balkonowych, podejścia wod-kan w łazience i kuchni.
- `scene/lighting.ts`: słońce z południa (pozycja dla Warszawy, październik ok. 13:00), niebo/HDRI jako światło otoczenia, cienie od słońca przez drzwi balkonowe; wieczór: światło nieba przygaszone, gołe żarówki na wypustach (ciepłe 2700 K).
- `scene/environment.ts`: niebo i proste otoczenie za oknami (sąsiednie bryły / zieleń w niskim detalu).
- `ui/modeSwitch.ts` (na razie tylko surowy + ścianka) i `ui/dayNight.ts`.

**Gotowe, gdy:** surowy tryb wygląda jak prawdziwe mieszkanie od dewelopera w dzień i wieczorem, mieści się w budżecie wydajności, wszystkie zasoby są w CREDITS.md.

---

## Etap 5 – Przebudowa i system trybów
**Cel:** przełączanie trzech trybów bez przeładowania strony.
- Wariant „po przebudowie”: ścianka sypialni, ścianka z drzwiami, skrzydło drzwi sypialni (otwierane do środka, zawiasy przy X 257), sypialnia na liście pokoi i minimapie.
- `core/state.ts` + `core/assets.ts`: tryb jako stan, lazy-load zasobów trybu z paskiem postępu, zwalnianie pamięci GPU po opuszczeniu trybu.
- Drzwi wewnętrzne (łazienka, sypialnia) tylko w wykończeniach; w trybie surowym same ościeża.
- Szkielet `modes/styl1.ts` i `styl2.ts` z podstawowymi materiałami ścian i podłóg (bez mebli) – do sprawdzenia przełączania.
- Zachowanie pozycji gracza przy zmianie trybu (jeśli pozycja trafia w nową ściankę – przesunięcie do najbliższego wolnego miejsca).

**Gotowe, gdy:** przełącznik w UI zmienia tryb w kilka sekund, minimapa i kolizje odpowiadają wariantowi, pamięć nie rośnie przy wielokrotnym przełączaniu.

---

## Etap 6 – Wykończenie styl 1 („moody walnut”)
**Cel:** pełne wykończenie zgodne z opisem stylu 1 w CLAUDE.md.
- Materiały: ciemny dymiony dąb, lamele orzech/wenge, ściany taupe/ciemne, łazienka: płyty w stylu ciemnego betonu.
- Meble (GLB CC0 z Poly Haven tam, gdzie pasują; reszta proceduralnie w `furniture/builders`): narożnik z szezlongiem, stolik, szafka RTV z lamelami, TV, stół owalny z krzesłami, kuchnia L (lodówka w zabudowie, płyta, piekarnik, zlew, szafki górne), łóżko z wezgłowiem, komoda, łazienka (walk-in z czarnym profilem, WC podwieszane, szafka z umywalką nablatową, okrągłe lustro z LED, pralka, grzejnik drabinkowy), zasłony i firany, dywany, rośliny, dodatki.
- Sprawdzenie ustawienia: przejścia ≥ 60 cm, łóżko poza zasięgiem skrzydła drzwi balkonowych, nic nie blokuje skrzydeł drzwi; meble dodane do kolizji.
- Oświetlenie wieczorne 2700 K: kule nad stołem, rattan w sypialni, LED za lamelami i w niszach, oczka; w dzień miękkie światło przez firany.

**Gotowe, gdy:** styl 1 jest rozpoznawalny względem zdjęć z `materialy/style/styl-1`, spacer płynny na telefonie.

*Stan po realizacji:* w salonie (13,8 m² z aneksem) przy sofie i ścianie TV mieści się okrągły stół dla 2 osób, nie owalny dla 4 – przy większym stole kuchnia i balkon byłyby odcięte. W sypialni nie ma komody ani fotela (przejście obok łóżka ma 58 cm). Modele GLB tylko dla roślin; reszta proceduralnie.

---

## Etap 7 – Wykończenie styl 2 (jasny minimalizm)
**Cel:** drugie wykończenie, wykorzystujące meble i buildery z etapu 6.
- Materiały: jasny dąb (deska lub jodełka w salonie), jasne lamele z LED, ściany kremowe/greige, kuchnia czarna mat + orzech, ciemny blat w stylu kamienia, łazienka: jasne płyty / marmur, pionowa mozaika.
- Meble: beżowy narożnik, fotel bouclé, okrągłe stoliki, wisząca szafka RTV, kuchnia z frontami z ryflowanego szkła i relingami, wysoka szafa z lustrem, łóżko tapicerowane, boazeria, szafa bez uchwytów, biurko we wnęce z półkami, łazienka z kamiennym blatem i białą ceramiką.
- Oświetlenie 3000 K: żyrandol z kulami, taśmy LED w obniżeniu sufitu, lampa stojąca, kinkiet w łazience.

**Gotowe, gdy:** styl 2 jest rozpoznawalny względem zdjęć z `materialy/style/styl-2`, oba wykończenia przełączają się płynnie.

*Stan po realizacji:* układ mebli jak w stylu 1 (te same sprawdzone przejścia), inne bryły i materiały. W sypialni zamiast szafy i biurka we wnęce – boazeria za łóżkiem (brak miejsca na zabudowę przy przejściu 58 cm); w kuchni bez wysokiej szafy z lustrem.

---

## Etap 8 – Optymalizacja i szlif
**Cel:** wersja do udostępnienia.
- Pomiar na prawdziwych telefonach (iOS + Android): FPS, czas ładowania, pamięć; łączenie geometrii, instancing, ograniczenie świateł, ewentualnie wypalone AO/lightmapy dla statycznych brył.
- Ekran ładowania z postępem, obsługa utraty kontekstu WebGL, komunikat dla przeglądarek bez WebGL2.
- Dostępność: sterowanie klawiaturą w HUD, kontrast, opis sterowania.
- Linki do konkretnego widoku (`#pokoj=salon&tryb=styl2`), opcjonalnie zrzut ekranu z widoku.
- Porządek w CREDITS.md, README dla odbiorcy, finalna publikacja.

**Gotowe, gdy:** budżet wydajności z CLAUDE.md spełniony na telefonie, strona działa z GitHub Pages bez błędów w konsoli.

---

## Ryzyka
- **Wydajność PBR + cienie na telefonie** – od etapu 3 profil jakości i pomiar FPS; w razie potrzeby wypalone oświetlenie zamiast cieni w czasie rzeczywistym.
- **Rozmiar zasobów** – KTX2, GLB z kompresją meshopt/Draco, lazy-load per tryb, tekstury 1k na telefonie.
- **Brak pasujących mebli CC0** – buildery proceduralne jako domyślna ścieżka, GLB tylko tam, gdzie wyraźnie podnoszą jakość.
- **iOS Safari** – brak pointer lock (tylko dotyk), ograniczenia pamięci GPU, gesty systemowe; testy od etapu 3.
- **Elektryka orientacyjna** – po otrzymaniu rzutu instalacji od dewelopera poprawka tylko w apartment.ts.
