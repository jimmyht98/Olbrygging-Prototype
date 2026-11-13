> **UTKAST – må bekreftes av bedriften.** Alle navn, produkter, datoer og tall i prototypen er fiktive.

# Ambassadørsiden

Klikkbar prototype for oppfølging av ambassadører hos Ølbrygging. Gruppe 10 har laget den i emnet IS-219 Digitalisering og tjenestedesign ved Universitetet i Agder, høsten 2026.

## Bakgrunn

Ølbrygging samarbeider med ambassadører og innholdsprodusenter innen ølbrygging, grill og pizza. Bedriften mangler struktur for oppfølgingen. Ambassadørene har begrenset tid og ønsker å beholde kreativ frihet.

Problemstillingen fra innsiktsarbeidet:

> Hvordan kan Ølbrygging effektivisere og strukturere oppfølgingen av ambassadører og innholdsprodusenter, uten å redusere den personlige kontakten, fleksibiliteten og kreative friheten som kundene verdsetter?

Prototypen bygger på designtenkningsprosessen i emnet: kundeintervjuer, kundereise, verdiforslag, tjenestekart og overordnet kravspesifikasjon.

## Formål

Prototypen har to bruksområder.

1. Brukertest med en ambassadør.
2. Demo for kontaktpersonen hos Ølbrygging.

Den er ikke et ferdig system. Den har ingen innlogging, ingen database og ingen kobling til nettbutikken.

## Kravdekning

| Krav fra kravspesifikasjonen | Dekning i prototypen |
| --- | --- |
| Samlet system for kunder og ansatte til å kommunisere og se produkter | Ambassadøren ser forslag og sender meldinger. Den ansatte ser svar og meldinger i ansattvisningen. Den ansatte svarer ikke i prototypen. |
| Oversikt over produkter ambassadøren velger å si ja til | Forslag-siden viser produkter med svarfrist, innholdsfrist og viktighet. Tre svarvalg. |
| Én ansatt har ansvar for én eller flere ambassadører | Ambassadøren ser sin faste kontaktperson. Den ansatte ser alle sine ambassadører i én oversikt. |

## Visninger

| Visning | Adresse | Innhold |
| --- | --- | --- |
| Oversikt | `#oversikt` | Kapasitet (god tid, litt tid, pause), neste frister, oppdrag ambassadøren har sagt ja til, evaluering etter publisert innhold |
| Forslag | `#forslag` | Interessevalg og produktforslag. Svarvalg: ja med innhold, ja uten løfte om innhold, nei takk |
| Avtale | `#avtale` | Hva ambassadøren får, hva Ølbrygging forventer, faste innsjekk, rabattkode |
| Kontakt | `#kontakt` | Fast kontaktperson, foretrukket kanal, meldingsskjema |
| Ansatt | `#ansatt` | «Mine ambassadører». Oversikt for den ansatte. Raden til Nora leser data fra ambassadørsiden |

Lenken til ansattvisningen ligger nederst på siden. Knappen for lys og mørk modus ligger øverst.

## Kobling til kundereisen

| Steg i kundereisen | Funksjon i prototypen |
| --- | --- |
| Finne et samarbeid etter interesser og kapasitet | Interessevalg og kapasitetsvalg |
| Avklare produkter, forventninger og frister | Avtale-siden og fristene på hvert forslag |
| Velge produkter og planlegge etter egen kapasitet | Ja eller nei på hvert forslag, «Be om mer tid» |
| Produsere innhold med eget kreativt uttrykk | Ingen krav til format, kanal eller antall innlegg |
| Vurdere videre samarbeid | Evaluering med fire spørsmål, valg mellom nytt oppdrag og pause, faste innsjekk |

## Kom i gang

Prototypen trenger verken server eller byggesteg.

1. Klon repoet.
2. Åpne `index.html` i en nettleser.

Siden henter skrifttyper fra Google Fonts. Uten nett bruker den reserveskrifter.

Publisering med GitHub Pages: gå til Settings, Pages, og velg grenen `main`.

## Filstruktur

| Fil | Innhold |
| --- | --- |
| `index.html` | Struktur og tekst i de fem visningene |
| `styles.css` | Stiler. Fargene for lys og mørk modus står øverst som variabler under `:root` |
| `app.js` | Logikk, ruting og fiktive data |

## Fiktive data

Dataene står øverst i `app.js`.

| Liste | Innhold |
| --- | --- |
| `SUGS` | Produktforslag med kategori, viktighet, svarfrist og innholdsfrist |
| `SLOTS` | Tidspunkter for innsjekk |
| `OTHERS` | De tre andre ambassadørene i ansattvisningen |
| `EVQ` | Evalueringsspørsmålene og svarvalgene |
| `INTERESTS`, `CHANNELS` | Interesser og kommunikasjonskanaler |

Ambassadøren Nora Lie, kontaktpersonen Ingrid Solheim, rabattkoden NORA10 og alle tall er oppdiktet.

Regel for repoet: legg aldri inn reelle bedriftsdata, kundelister, produkteksporter eller navn på informanter uten skriftlig godkjenning fra Ølbrygging og personene det gjelder.

## Tilstand og lagring

Valgene i prototypen lagres i nettleserens `localStorage`.

| Nøkkel | Innhold |
| --- | --- |
| `ambassador-proto-v1` | Svar, kapasitet, avtale, innsjekk, meldinger og evalueringer |
| `ambassador-proto-theme` | Valgt lys eller mørk modus |

Knappen «Nullstill testen» sletter alle valg unntatt modus. Bruk den mellom hver testperson.

## Brukertest

Tre spørsmål testen skal gi svar på.

1. Svarvalget «Ja, uten løfte om innhold». Ambassadørene ønsker frihet, og bedriften ønsker kontinuitet. Hvilket svar velger testpersonen, og hvorfor?
2. Kanalvalget. Oppleves siden som et tillegg til dagens kanal, eller som en ekstra byrde?
3. Pause. Oppleves valget trygt, eller frykter testpersonen å miste samarbeidet?

## Avgrensninger

- Ansattvisningen er en ren oversikt. Den ansatte sender ikke forslag, gir ikke ny frist og svarer ikke på meldinger.
- Data deles ikke mellom enheter. Ambassadørsiden og ansattvisningen må åpnes i samme nettleser.
- Produktforslagene er faste. De hentes ikke fra nettbutikken.
- Prototypen er ikke testet med skjermleser.

## Uavklarte punkter

Ølbrygging har ikke bekreftet disse punktene.

- Innholdet i samarbeidsavtalen og avtaleperioden.
- Svarfrister og innholdsfrister.
- Ordningen med én fast kontaktperson per ambassadør.
- Hyppigheten på faste innsjekk.
- Regelverket for alkoholreklame i sosiale medier og følgene for innholdet. Prototypen tar ikke stilling til dette.

## Bruk av KI

Koden i første versjon er generert med Claude (Anthropic) ut fra gruppens egne funn og kravspesifikasjon. Gruppen har styrt valg av hovedbruker, funksjoner og omfang. Gruppen tester og redigerer koden videre i dette repoet.

Punkter gruppen verifiserer selv:

- At funksjonene samsvarer med funn fra intervjuer og kundemøte.
- At prototypen fungerer i nettleser på mobil og PC, i lys og mørk modus.
- At ingen reelle data ligger i koden.

## Status

Utkast. Venter på brukertest og bekreftelse fra Ølbrygging.
