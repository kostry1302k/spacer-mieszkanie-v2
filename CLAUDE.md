# Wirtualny spacer – Mieszkanie M12, Skypoint 57

> **Stan na 26.10.2026: kopia silnika ze spaceru M12 (repo `spacer-mieszkanie-v1`).** Dane mieszkania i stylów poniżej
> (wymiary, `src/data/apartment.ts`, `src/data/modes/styl*.ts`, opisy stylów, decyzje) dotyczą jeszcze M12 i zostaną podmienione
> po dostarczeniu materiałów nowego mieszkania – lista w `materialy/CO-TU-WRZUCIC.md`. `materialy/wymiary.md` jeszcze nie istnieje.

Statyczna strona z wirtualnym spacerem po mieszkaniu 30,12 m² (hol, łazienka, pokój dzienny z aneksem, balkon; po przebudowie dodatkowo sypialnia). Widok z perspektywy człowieka, trzy tryby: stan surowy i dwa wykończenia (styl 1, styl 2). Działa w przeglądarce na komputerze i telefonie, publikowana jako statyczne pliki.

Plan prac w etapach: [PLAN.md](PLAN.md).

## Źródła prawdy
1. [materialy/wymiary.md](materialy/wymiary.md) – **jedyne źródło wymiarów**. Ważniejsze niż skalowanie z rzutów.
2. Rzut wykonawczy A.03 1:50 (`materialy/rzuty/A.03 RZUT 1 PIE╠ĘTRA (1).pdf`, 1,4 MB) – gdy w wymiary.md czegoś brakuje.
3. Rzut budowlany 1:100 (drugi plik A.03, 0,7 MB), karta lokalu (dotyczy sąsiedniego M13) i koncept PNG – tylko odniesienie.
4. `materialy/style/styl-1`, `styl-2` – zdjęcia inspiracji (opis niżej). Stylu 3 nie ma i nie będzie.

`materialy/` jest tylko do odczytu, z wyjątkiem wymiary.md, który zmieniamy wyłącznie po decyzji właściciela i z wpisem w „Historii zmian”.

## Najważniejsze decyzje (25.10.2026)
- Wymiary z rzutu wykonawczego: 539 × 579,5, wysokość 270 we wszystkich trybach.
- Balkon na **południe** (+Y = południe). Słońce realne dla Warszawy (52,2° N), domyślnie dzień w październiku.
- Tryb surowy = stan deweloperski + przełącznik „pokaż nową ściankę”. Wykończenia = zawsze wariant po przebudowie (sypialnia 9,19 m²).
- Łazienka: walk-in 90 × 80 z czarnym profilem, WC, umywalka, pralka. Bez wanny i suszarki.
- Kuchnia w układzie deweloperskim (L wokół szachtu).
- Wyposażenie wykończeń (26.10.2026): sypialnia – łóżko 140 × 200 przy oknie i szafa 120 × 60 do sufitu obok; salon – sofa 160, stół kwadratowy 75 × 75 przy ścianie prawej z 3 krzesłami; hol – szafa 80 × 50 do sufitu przy ścianie wejściowej (szczegóły w wymiary.md).
- Drzwi balkonowe: jedno skrzydło rozwierne do środka przy zewnętrznym ościeżu, część przy filarze stała.
- Grzejniki: po jednym na filarku 69,5 obok każdych drzwi balkonowych; brak na ścianie lewej.
- Elektryka: typowy układ (gniazdka 30 cm, włączniki 110 cm, gniazdka nad blatem), oznaczony w danych jako `orientacyjny`.
- Światło: dzień (słońce + niebo) i wieczór (ciepłe światło sztuczne), przełącznik w UI.
- Hosting: GitHub Pages przez GitHub Actions. Apps Script odpada (HtmlService nie serwuje plików statycznych typu tekstury, GLB, KTX2; strona działa w piaskownicy iframe, co psuje pointer lock i ładowanie zasobów). Build z `base: './'`, więc działa też na Netlify/Cloudflare Pages.

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
vite.config.ts             – base './', podział chunków
package.json
.github/workflows/deploy.yml – build i publikacja na GitHub Pages
materialy/                 – materiały źródłowe (tylko odczyt)
public/assets/
  textures/<id>/<1k|2k>/   – tekstury PBR CC0: color.jpg, normal.jpg (OpenGL), roughness.jpg
  models/<id>.glb          – meble GLB (skompresowane)
  hdri/<id>_<1k|2k>.hdr    – niebo/otoczenie (telefon 1k, komputer 2k)
  CREDITS.md               – źródło, autor, licencja każdego zasobu (generuje `npm run assets`)
scripts/
  fetch-assets.ts          – pobiera zasoby z listy (Poly Haven API / ambientCG), konwertuje, zapisuje CREDITS
  check-data.ts            – walidacja danych mieszkania (zamknięte obrysy, otwory w ścianach, metraże vs wymiary.md)
src/
  main.ts                  – start aplikacji, spina moduły
  core/
    units.ts               – cm → m (dane w cm, scena w metrach: 1 jednostka = 1 m)
    plan.ts                – obliczenia na rzucie: pole i środek wielokąta, oś ściany, filtr wariantu (bez zależności, używa go też check-data)
    state.ts               – stan aplikacji (tryb, widok, pora dnia, nowa ścianka, opcje makiety) i prosty magazyn z subskrypcją
    quality.ts             – profil jakości (mobile/desktop) i automatyczne obniżanie (DPR, potem cienie) przy FPS < 30
    assets.ts              – materiały trybów ładowane przy pierwszym użyciu, wspólne tekstury, zwalnianie pamięci GPU po zmianie trybu
    debug.ts               – tryb `?debug` w adresie: licznik FPS; w konsoli `app.walk(...)`, `app.pick()` do testów
  data/
    apartment.ts           – JEDYNY plik geometrii: ściany, otwory, drzwi, okna, szachty, pokoje, wysokości, balkon, grzejniki, elektryka
    types.ts               – typy danych (Wall, Opening, Door, Room, Fixture…)
    modes/
      index.ts             – definicje trybów (nazwa, materiały, wymuszony wariant, drzwi wewnętrzne, oprawy sufitowe)
      common.ts            – powierzchnie wspólne dla trybów (stolarka, elewacja, grzejniki, osprzęt)
      raw.ts               – tryb surowy: wylewka, szary tynk, gołe żarówki
      styl1.ts, styl2.ts   – materiały wykończenia, paleta mebli i lista mebli (typ, środek obrysu w cm, kierunek frontu, parametry)
      styl1.ts             – wykończenie styl 1: materiały, meble, oprawy
      styl2.ts             – wykończenie styl 2
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
- **Geometria tylko z `src/data/apartment.ts`.** Żadnych liczb wymiarowych w modułach geometrii, sterowania czy minimapy. Dane w cm, dokładnie jak w wymiary.md (te same nazwy i współrzędne), konwersja na metry w jednym miejscu (`core/units.ts`).
- Zmiana wymiaru: najpierw wymiary.md (za zgodą właściciela), potem apartment.ts, potem `npm run check:data`.
- Układ współrzędnych jak w wymiary.md: X w prawo, Y w głąb (→ w Three.js oś Z), wysokość → oś Y Three.js. Początek w narożniku ściany wejściowej i lewej.
- Ściany sąsiednie (21 cm) i zewnętrzna (39,5 cm) modelujemy z prawdziwą grubością, żeby ościeża i wnęki okien wyglądały wiarygodnie.
- Tryby różnią się tylko danymi w `data/modes/*`; kod budujący scenę jest wspólny. Materiał lica ściany i podłogi wynika z rodzaju pomieszczenia (`Room.kind`), np. łazienka → `wallBathroom` / `floorBathroom`. Przełączenie trybu nie przeładowuje strony, zasoby trybu ładujemy przy pierwszym użyciu.
- **Zasoby tylko CC0**: Poly Haven (tekstury, HDRI, modele), ambientCG (tekstury). Każdy plik wpisany do `public/assets/CREDITS.md` (URL, autor, licencja). Nie dodawać zasobów bez licencji ani z „free for personal use”.
- Meble to dane (`FurnitureItem` w `data/modes/styl*.ts`), nie kod: przy rozstawianiu pilnuj pola skrzydeł drzwi (balkonowe X 69,5–159,5 i 379,5–469,5 do Y ≈ 490, łazienka, sypialnia) i przejść ≥ 45 cm (gracz ma promień 22 cm). Trasy sprawdzaj w konsoli `?debug` (`app.walk`).
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
npm run check:data   # walidacja apartment.ts
npm run assets       # pobranie i konwersja zasobów CC0 (tylko macOS – używa sips)
```

## Style wykończenia (z analizy zdjęć)

### Styl 1 – „Mocca & Orzech”, ciepły ciemny minimalizm
**Źródło prawdy dla stylu 1: `materialy/style/styl-1/M12 Skypoint 57 — Styl 1.pdf`** (9 plansz: paleta, rzut z aranżacją, widoki ścian z wymiarami, światło). Dane w `src/data/modes/styl1.ts` odwzorowują ten dokument; zmiany stylu 1 zaczynamy od niego.
- **Paleta:** Len #CFC3B3 (ściany), Glina #8D7D6D (ściana za łóżkiem i fronty szafy w sypialni), Mocca #3B2F28 (filc pod lamelami, zasłony, akcenty), dąb wędzony #5A4130 (lamele, dolne fronty i słupek kuchni, szafa w holu, panel-wezgłowie, szafka pod umywalką), dąb w jodełkę #8E6A4B (jedna podłoga bez progów), spiek greige #A89B8B 60 × 120 (łazienka do sufitu, blaty i plecy kuchni), len i bouclé/welur greige, czerń mat, opal, rattan.
- **Salon:** lamele na całej nowej ściance (357,5 × 270) z profilem LED w suficie, wisząca szafka RTV 200 × 35 (25 cm nad podłogą, LED pod spodem), TV 55″, sofa 160 × 90 welur greige, stolik ø 60 mocca, dywan 160 × 230, lampa z lnianym abażurem, reflektor 3-punktowy.
- **Aneks:** L wokół szachtu, dół dąb wędzony, szafki górne w kolorze ściany do sufitu, zmywarka 45, stół 75 × 75 przy ścianie, 3 krzesła z plecionką, grono opalowych kul ~62 cm nad stołem.
- **Sypialnia:** łóżko 140 × 200 bouclé przy oknie, panel-wezgłowie 202 × 112 z półką i LED, szafa 120 × 60 do sufitu w kolorze Glina z czarnymi uchwytami, szafka nocna 40 × 40 z lampką, kinkiety, rattanowa lampa, dywan 130 × 200.
- **Łazienka:** spiek greige pionowo do sufitu (tekstura płytek rysowana w programie – `TilesSpec`), gres drewnopodobny na dwóch ścianach prysznica z niszą LED, wspólny blat 120 × 52 nad pralką i szufladą, szafka z lustrem 116 × 75 z podświetleniem, białe WC na zabudowie stelaża (półka), czarny grzejnik drabinkowy.
- **Hol:** szafa 80 × 50 do sufitu z frontami z lamel, lustro 60 × 180 na ściance od kuchni, 3 oprawy w suficie.
- **Balkon:** płyty tarasowe drewnopodobne, stolik z dwoma krzesłami, donica, kinkiet na filarze.
- **Światło:** wszystko 2700 K, wiele małych źródeł (LED w lamelach, pod szafkami, w niszach, lampy jako akcenty).
- **Odstępstwa od PDF w spacerze:** stolik kawowy przesunięty 18 cm w stronę sofy, a zestaw na balkonie 10 cm w stronę ściany – inaczej przejścia miałyby < 44 cm. Opcjonalna ławka w holu – pominięta.

### Styl 2 – jasny, ciepły minimalizm z kontrastową kuchnią
- **Materiały:** podłoga z jasnego dębu (deska; w salonie możliwa jodełka); jasne lamele dębowe przy TV z podświetleniem LED; firany lniane i zasłony taupe; w kuchni fronty czarne matowe i orzechowe.
- **Kolory:** ściany kremowe i greige, sufit biały; tkaniny beżowe i ecru; akcenty: czarne okrągłe stoliki, karmelowa pufa, ciemne poduszki.
- **Meble:**
  - salon: beżowa sofa narożna z szezlongiem, fotel bouclé, okrągły stolik kawowy czarny lub z ryflowanego drewna, wisząca szafka RTV, gruby jasny dywan;
  - kuchnia: dolne fronty orzechowe, górne czarne matowe, część z ryflowanym szkłem i podświetleniem; ciemny blat i ściana nad blatem w stylu kamienia; czarne relingi, lampy punktowe na szynie; wysoka szafa w orzechu z lustrem;
  - sypialnia: tapicerowane łóżko taupe, ciemna boazeria drewniana na ścianie, szafa bez uchwytów w jasnym greige, biurko we wnęce z podświetlanymi półkami, ciemne szafki nocne.
- **Łazienka:** jasne płyty greige lub imitujące marmur (ściana prysznica), drobna pionowa mozaika na ścianie umywalki, wisząca szafka orzechowa z kamiennym blatem, biała ceramika, czarna matowa armatura, szklany walk-in z niszą LED, lustro z zaokrąglonymi narożnikami.
- **Światło:** jaśniejsze, rozproszone, 3000 K – żyrandol z mlecznymi kulami / sputnik, taśmy LED w obniżeniach sufitu, lampa stojąca z abażurem, kinkiet w łazience; w dzień dużo światła przez firany.

### Stan surowy
Wylewka cementowa (szara, lekko plamista), ściany i sufit z szarego tynku gipsowego/cementowo-wapiennego (bez malowania), puszki i gniazdka (białe, orientacyjne), wypusty z kablami na suficie, grzejniki płytowe białe, piony w szachtach otynkowane, drzwi wejściowe EI30 i stolarka balkonowa (antracyt), brak drzwi wewnętrznych (tylko ościeża), brak mebli i osprzętu łazienki/kuchni (tylko podejścia instalacyjne).
