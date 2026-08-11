import { supabase } from "@/lib/supabase";

export const ANGLES = [
  "tecnica", "ingredienti", "panificazione", "attrezzatura", "business",
  "storia", "gourmet", "miti", "faq", "avviare", "vita",
] as const;
export type Angle = (typeof ANGLES)[number];

export type Topic = {
  id: number;
  angle: Angle;
  topic: string;
  /** Se presente, l'argomento riguarda un ingrediente di pregio: la generazione deve
   * suggerire anche una ricetta da salvare come bozza nel ricettario. */
  ingredient?: string;
  /** Se presente, raggruppa argomenti che parlano dello stesso soggetto specifico sotto
   * angoli diversi (es. "sale" per i 3 topic sul sale). Usato da pickNextTopic() per
   * evitare che due argomenti della stessa famiglia escano a distanza ravvicinata, anche
   * se il testo è diverso e quindi non verrebbe mai bloccato dal solo confronto esatto.
   * Quando assente ma `ingredient` è presente, la famiglia è implicitamente il valore di
   * `ingredient` (due topic sullo stesso ingrediente specifico sono la stessa famiglia). */
  family?: string;
};

// 300 argomenti/microargomenti su pizza e arte bianca (pane incluso), pensati per la
// rotazione forzata dei contenuti standalone: ognuno viene assegnato una sola volta
// prima di essere riproposto, garantendo varietà reale nel tempo.
export const TOPICS: Topic[] = [
  // ── tecnica (1-30) ─────────────────────────────────────────────────────
  { id: 1, angle: "tecnica", topic: "Autolisi: cos'è e quando conviene farla", family: "autolisi" },
  { id: 2, angle: "tecnica", topic: "Biga vs poolish: differenze pratiche in laboratorio" },
  { id: 3, angle: "tecnica", topic: "Impasto diretto vs indiretto: quando scegliere l'uno o l'altro" },
  { id: 4, angle: "tecnica", topic: "Idratazione oltre il 70%: rischi e vantaggi reali" },
  { id: 5, angle: "tecnica", topic: "Temperatura dell'acqua e il suo effetto sulla fermentazione" },
  { id: 6, angle: "tecnica", topic: "Durezza e pH dell'acqua: perché cambia il risultato" },
  { id: 7, angle: "tecnica", topic: "Staglio e puntatura: gli errori più comuni" },
  { id: 8, angle: "tecnica", topic: "Lievitazione a temperatura ambiente vs in frigorifero" },
  { id: 9, angle: "tecnica", topic: "Lievito madre: mantenimento quotidiano in pizzeria" },
  { id: 10, angle: "tecnica", topic: "Il cornicione: come ottenerlo alto e alveolato" },
  { id: 11, angle: "tecnica", topic: "Il malto: quando serve davvero e quando è superfluo" },
  { id: 12, angle: "tecnica", topic: "Errori di cottura più comuni e come correggerli" },
  { id: 13, angle: "tecnica", topic: "Fermentazione a freddo: tempi e temperature ideali" },
  { id: 14, angle: "tecnica", topic: "Puntata lunga vs appretto lungo: cosa cambia nel prodotto finale" },
  { id: 15, angle: "tecnica", topic: "Perché due impasti con la stessa identica ricetta possono venire diversi" },
  { id: 16, angle: "tecnica", topic: "Gestione dell'impasto nei mesi caldi: correttivi pratici" },
  { id: 17, angle: "tecnica", topic: "Gestione dell'impasto nei mesi freddi: correttivi pratici" },
  { id: 18, angle: "tecnica", topic: "Stesura a mano vs al mattarello: differenze sul risultato" },
  { id: 19, angle: "tecnica", topic: "La prova del velo: come capire se l'impasto è pronto" },
  { id: 20, angle: "tecnica", topic: "Rinfreschi del lievito madre: frequenza e proporzioni" },
  { id: 21, angle: "tecnica", topic: "Impasto per pizza in teglia vs impasto per pizza tonda" },
  { id: 22, angle: "tecnica", topic: "Come riconoscere un impasto sovralievitato prima di infornare" },
  { id: 23, angle: "tecnica", topic: "Come recuperare un impasto poco sviluppato" },
  { id: 24, angle: "tecnica", topic: "Il ruolo della maglia glutinica nella struttura della pizza" },
  { id: 25, angle: "tecnica", topic: "Doppia cottura per la pizza in teglia: perché funziona" },
  { id: 26, angle: "tecnica", topic: "Ruotare la pizza in cottura: quando farlo e perché" },
  { id: 27, angle: "tecnica", topic: "Tempi di cottura ideali in base al tipo di forno" },
  { id: 28, angle: "tecnica", topic: "Come capire se un forno è davvero pronto per infornare" },
  { id: 29, angle: "tecnica", topic: "Farciture pre-cottura vs post-cottura: quando cambia il risultato" },
  { id: 30, angle: "tecnica", topic: "Bilanciare sale e lievito nell'impasto: un equilibrio delicato", family: "sale" },

  // ── ingredienti (31-60) ────────────────────────────────────────────────
  { id: 31, angle: "ingredienti", topic: "Come leggere una scheda tecnica della farina (W, P/L)" },
  { id: 32, angle: "ingredienti", topic: "Farina 00 vs tipo 0 vs integrale: differenza nella resa" },
  { id: 33, angle: "ingredienti", topic: "Il pomodoro giusto per la pizza: varietà e stagionalità" },
  { id: 34, angle: "ingredienti", topic: "Alternative al pomodoro fresco fuori stagione" },
  { id: 35, angle: "ingredienti", topic: "Fior di latte vs mozzarella di bufala: quando usarle" },
  { id: 36, angle: "ingredienti", topic: "Gestire l'umidità della mozzarella in cottura" },
  { id: 37, angle: "ingredienti", topic: "Farine alternative (kamut, farro, segale) in pizzeria" },
  { id: 38, angle: "ingredienti", topic: "Scegliere un olio EVO da usare a crudo" },
  { id: 39, angle: "ingredienti", topic: "Pizza senza glutine: le sfide tecniche reali" },
  { id: 40, angle: "ingredienti", topic: "Il sale: tipologie e momento giusto di inserimento", family: "sale" },
  { id: 41, angle: "ingredienti", topic: "Lievito di birra fresco vs secco: differenze pratiche" },
  { id: 42, angle: "ingredienti", topic: "Semola rimacinata: quando usarla nell'impasto", family: "semola-rimacinata" },
  { id: 43, angle: "ingredienti", topic: "Farine integrali: come bilanciarle senza appesantire l'impasto" },
  { id: 44, angle: "ingredienti", topic: "Grassi nell'impasto: quando aggiungerli e perché" },
  { id: 45, angle: "ingredienti", topic: "Zuccheri nell'impasto: funzione reale oltre il sapore" },
  { id: 46, angle: "ingredienti", topic: "Acqua di rete vs acqua filtrata: fa davvero differenza?" },
  { id: 47, angle: "ingredienti", topic: "Come scegliere il formaggio giusto per ogni tipo di pizza" },
  { id: 48, angle: "ingredienti", topic: "Salumi in pizzeria: cosa cambia tra crudo e cotto in forno" },
  { id: 49, angle: "ingredienti", topic: "Verdure di stagione: costruire il menù intorno alla stagionalità" },
  { id: 50, angle: "ingredienti", topic: "Erbe aromatiche fresche vs essiccate sulla pizza" },
  { id: 51, angle: "ingredienti", topic: "Origano: varietà e differenze di aroma" },
  { id: 52, angle: "ingredienti", topic: "Il basilico va messo prima o dopo la cottura?" },
  { id: 53, angle: "ingredienti", topic: "Come conservare correttamente gli impasti pronti" },
  { id: 54, angle: "ingredienti", topic: "Materie prime a km zero: vantaggi reali per una pizzeria" },
  { id: 55, angle: "ingredienti", topic: "Etichette e provenienza: cosa guardare davvero nei fornitori" },
  { id: 56, angle: "ingredienti", topic: "La farina di Tumminia, grano antico siciliano: caratteristiche e uso in impasto", ingredient: "Farina di Tumminia" },
  { id: 57, angle: "ingredienti", topic: "Il Pecorino Romano DOP: quando esaltarlo su una pizza", ingredient: "Pecorino Romano DOP" },
  { id: 58, angle: "ingredienti", topic: "L'olio EVO Riviera Ligure DOP: profilo aromatico e uso a crudo", ingredient: "Olio EVO Riviera Ligure DOP" },
  { id: 59, angle: "ingredienti", topic: "Il sale marino di Trapani: perché molti pizzaioli lo scelgono", ingredient: "Sale Marino di Trapani", family: "sale" },
  { id: 60, angle: "ingredienti", topic: "Il grano Senatore Cappelli: un grano antico tornato di moda", ingredient: "Grano Senatore Cappelli" },

  // ── panificazione / arte bianca (61-95) ─────────────────────────────────
  { id: 61, angle: "panificazione", topic: "Lievito madre per il pane vs lievito madre per pizza" },
  { id: 62, angle: "panificazione", topic: "Pane a lunga lievitazione: tecnica base" },
  { id: 63, angle: "panificazione", topic: "Lievito di birra vs pasta madre: quando scegliere l'una o l'altro" },
  { id: 64, angle: "panificazione", topic: "Autolisi nel pane: stessa logica della pizza, risultati diversi", family: "autolisi" },
  { id: 65, angle: "panificazione", topic: "Grissini artigianali: tecnica e varianti" },
  { id: 66, angle: "panificazione", topic: "Focaccia genovese: il ruolo della salamoia nella crosta", family: "focaccia-genovese" },
  { id: 67, angle: "panificazione", topic: "Taralli pugliesi: tradizione e tecnica" },
  { id: 68, angle: "panificazione", topic: "Pane in cassetta fatto in laboratorio di pizzeria" },
  { id: 69, angle: "panificazione", topic: "Diversificare il menù con prodotti da forno oltre la pizza" },
  { id: 70, angle: "panificazione", topic: "Panettone e colomba: perché sono un mondo tecnico a parte" },
  { id: 71, angle: "panificazione", topic: "Baguette in stile francese fatta da un pizzaiolo italiano" },
  { id: 72, angle: "panificazione", topic: "Pane di semola rimacinata: caratteristiche e usi", family: "semola-rimacinata" },
  { id: 73, angle: "panificazione", topic: "Conservazione del pane fatto in casa o in pizzeria: errori comuni" },
  { id: 74, angle: "panificazione", topic: "Il ruolo della farina di segale nei prodotti da forno" },
  { id: 75, angle: "panificazione", topic: "Pane con lievito madre solido vs licoli" },
  { id: 76, angle: "panificazione", topic: "Doppia lievitazione nel pane vs singola nella pizza: perché cambia" },
  { id: 77, angle: "panificazione", topic: "La crosta perfetta: vapore e temperatura in cottura del pane" },
  { id: 78, angle: "panificazione", topic: "Pane integrale: bilanciare sapore e digeribilità" },
  { id: 79, angle: "panificazione", topic: "Ciabatta italiana: tecnica e alveolatura" },
  { id: 80, angle: "panificazione", topic: "Pane pugliese di Altamura: caratteristiche tecniche" },
  { id: 81, angle: "panificazione", topic: "Pane casereccio: differenze regionali in Italia" },
  { id: 82, angle: "panificazione", topic: "Panini da hamburger fatti in casa: tecnica base" },
  { id: 83, angle: "panificazione", topic: "Pane carasau sardo: tradizione e sottigliezza estrema" },
  { id: 84, angle: "panificazione", topic: "Schiacciata toscana: differenze con la focaccia genovese", family: "focaccia-genovese" },
  { id: 85, angle: "panificazione", topic: "Pane azzimo e pane con lievito: differenze culturali e tecniche" },
  { id: 86, angle: "panificazione", topic: "Il ruolo della farina forte nei prodotti a lunga lievitazione" },
  { id: 87, angle: "panificazione", topic: "Impasti dolci lievitati: perché richiedono più tempo" },
  { id: 88, angle: "panificazione", topic: "Brioche da forno: tecnica base per chi viene dal mondo pizza" },
  { id: 89, angle: "panificazione", topic: "Pane senza glutine: le sfide reali per un fornaio" },
  { id: 90, angle: "panificazione", topic: "Come costruire un piccolo reparto panificazione in pizzeria" },
  { id: 91, angle: "panificazione", topic: "Taglio della pasta a mano vs con lama: impatto sull'alveolatura" },
  { id: 92, angle: "panificazione", topic: "Il ruolo della farina Manitoba nei lievitati importanti" },
  { id: 93, angle: "panificazione", topic: "Come recuperare un pane troppo compatto" },
  { id: 94, angle: "panificazione", topic: "Pane con semi e cereali: bilanciare struttura e sapore" },
  { id: 95, angle: "panificazione", topic: "Focacce farcite: tecnica di cottura in due tempi" },

  // ── attrezzatura (96-110) ───────────────────────────────────────────────
  { id: 96, angle: "attrezzatura", topic: "Forno elettrico vs forno a legna: guida pratica alla scelta" },
  { id: 97, angle: "attrezzatura", topic: "Manutenzione ordinaria del forno a legna" },
  { id: 98, angle: "attrezzatura", topic: "Cella frigorifera: temperature e gestione degli impasti" },
  { id: 99, angle: "attrezzatura", topic: "La pala giusta per ogni tipo di pizza" },
  { id: 100, angle: "attrezzatura", topic: "Impastatrici a spirale vs a forcella" },
  { id: 101, angle: "attrezzatura", topic: "Strumenti indispensabili per chi inizia" },
  { id: 102, angle: "attrezzatura", topic: "Termometri e strumenti di controllo in laboratorio" },
  { id: 103, angle: "attrezzatura", topic: "Quando conviene investire in un forno professionale" },
  { id: 104, angle: "attrezzatura", topic: "Forno a gas: pro e contro rispetto a legna ed elettrico" },
  { id: 105, angle: "attrezzatura", topic: "Teglie in alluminio vs in ferro blu per la pizza in teglia" },
  { id: 106, angle: "attrezzatura", topic: "Il ruolo della pietra refrattaria nella cottura casalinga" },
  { id: 107, angle: "attrezzatura", topic: "Cassette per la lievitazione: materiali e manutenzione" },
  { id: 108, angle: "attrezzatura", topic: "Bilance di precisione: perché contano più di quanto si pensi" },
  { id: 109, angle: "attrezzatura", topic: "Affettatrici in pizzeria: quando servono davvero" },
  { id: 110, angle: "attrezzatura", topic: "Attrezzature minime per aprire un piccolo laboratorio da forno" },

  // ── business (111-140) ─────────────────────────────────────────────────
  { id: 111, angle: "business", topic: "Calcolare davvero il food cost", family: "food-cost" },
  { id: 112, angle: "business", topic: "Fissare il prezzo di una pizza dal food cost reale", family: "food-cost" },
  { id: 113, angle: "business", topic: "Costruire un menù che funziona per margine e produzione" },
  { id: 114, angle: "business", topic: "Gestire le recensioni negative online" },
  { id: 115, angle: "business", topic: "Il ruolo dei social nella scelta della pizzeria da parte del cliente" },
  { id: 116, angle: "business", topic: "Gestire il personale nel turno di sabato sera" },
  { id: 117, angle: "business", topic: "Formare un nuovo pizzaiolo assunto in due settimane" },
  { id: 118, angle: "business", topic: "Sostenibilità e riduzione sprechi in pizzeria" },
  { id: 119, angle: "business", topic: "Gestione del magazzino e rotazione delle materie prime" },
  { id: 120, angle: "business", topic: "Marketing locale a basso budget per una pizzeria di quartiere" },
  { id: 121, angle: "business", topic: "Fidelizzare il cliente oltre lo sconto" },
  { id: 122, angle: "business", topic: "Quando conviene aprire il servizio delivery" },
  { id: 123, angle: "business", topic: "Come gestire i picchi di lavoro senza perdere qualità" },
  { id: 124, angle: "business", topic: "Contratti e turni: organizzare il personale in modo sostenibile" },
  { id: 125, angle: "business", topic: "Il ruolo del menù digitale e dei QR code al tavolo" },
  { id: 126, angle: "business", topic: "Fornitori: come scegliere e quando cambiare" },
  { id: 127, angle: "business", topic: "Gestire una pizzeria con più sedi: le sfide organizzative" },
  { id: 128, angle: "business", topic: "Il costo reale di uno spreco alimentare in pizzeria" },
  { id: 129, angle: "business", topic: "Comunicare un aumento di prezzo ai clienti abituali" },
  { id: 130, angle: "business", topic: "Recensioni false e come riconoscerle" },
  { id: 131, angle: "business", topic: "Costruire una routine di pulizia e sicurezza alimentare (HACCP)" },
  { id: 132, angle: "business", topic: "Gestire un reclamo al tavolo senza perdere il cliente" },
  { id: 133, angle: "business", topic: "Analizzare i dati di vendita per ottimizzare il menù" },
  { id: 134, angle: "business", topic: "Il ruolo del passaparola in un'attività locale" },
  { id: 135, angle: "business", topic: "Collaborazioni con altre attività locali: quando hanno senso" },
  { id: 136, angle: "business", topic: "Gestire le consegne a domicilio senza svalutare il prodotto" },
  { id: 137, angle: "business", topic: "Investire in formazione del personale: ritorno reale" },
  { id: 138, angle: "business", topic: "Differenziarsi in una zona satura di pizzerie" },
  { id: 139, angle: "business", topic: "Gestire eventi privati e catering da una pizzeria" },
  { id: 140, angle: "business", topic: "Pianificare gli acquisti in base alla stagionalità del menù" },

  // ── storia (141-185) ────────────────────────────────────────────────────
  { id: 141, angle: "storia", topic: "Storia del grano e delle farine in Italia" },
  { id: 142, angle: "storia", topic: "Storia della pizza napoletana: dalle origini a oggi" },
  { id: 143, angle: "storia", topic: "Differenze tra stili regionali italiani (Napoli, Roma, Genova, Torino)" },
  { id: 144, angle: "storia", topic: "La filosofia della lunga lievitazione e alta idratazione diffusa da Gabriele Bonci", family: "gabriele-bonci" },
  { id: 145, angle: "storia", topic: "L'eredità di Gabriele Bonci nel rendere la pizza al taglio romana un prodotto gourmet popolare", family: "gabriele-bonci" },
  { id: 146, angle: "storia", topic: "Storia della pizza in teglia romana" },
  { id: 147, angle: "storia", topic: "AVPN e il disciplinare della vera pizza napoletana" },
  { id: 148, angle: "storia", topic: "Come la pizza è diventata un fenomeno globale" },
  { id: 149, angle: "storia", topic: "Storia della focaccia genovese", family: "focaccia-genovese" },
  { id: 150, angle: "storia", topic: "Le origini della pizza fritta napoletana" },
  { id: 151, angle: "storia", topic: "La storia del lievito madre nella panificazione italiana" },
  { id: 152, angle: "storia", topic: "Come è nata la pizza margherita: il mito e i fatti", family: "pizza-margherita" },
  { id: 153, angle: "storia", topic: "La pizza come cibo di strada: origini popolari" },
  { id: 154, angle: "storia", topic: "Storia della pizza in Sicilia: lo sfincione" },
  { id: 155, angle: "storia", topic: "La diffusione della pizza negli Stati Uniti nel Novecento" },
  { id: 156, angle: "storia", topic: "Storia del forno a legna nella tradizione italiana" },
  { id: 157, angle: "storia", topic: "Le origini della focaccia barese" },
  { id: 158, angle: "storia", topic: "La tradizione dei forni di quartiere a Roma" },
  { id: 159, angle: "storia", topic: "Storia della farina 00 e della sua industrializzazione" },
  { id: 160, angle: "storia", topic: "Come sono nate le pizzerie a taglio in Italia" },
  { id: 161, angle: "storia", topic: "La tradizione del pane nelle campagne italiane del passato" },
  { id: 162, angle: "storia", topic: "Storia dei grani antichi e il loro recupero recente", family: "grani-antichi" },
  { id: 163, angle: "storia", topic: "Le origini della pinsa romana" },
  { id: 164, angle: "storia", topic: "Storia della pizza gourmet in Italia negli ultimi 20 anni" },
  { id: 165, angle: "storia", topic: "Come la pizza si è evoluta da cibo povero a prodotto d'autore" },
  { id: 166, angle: "storia", topic: "La burrata di Andria: come nasce e perché è diventata un simbolo pugliese", ingredient: "Burrata di Andria IGP" },
  { id: 167, angle: "storia", topic: "La mozzarella di bufala campana DOP: storia di un prodotto identitario", ingredient: "Mozzarella di Bufala Campana DOP" },
  { id: 168, angle: "storia", topic: "Il pomodorino del Piennolo del Vesuvio: storia di un pomodoro che si conserva appeso", ingredient: "Pomodorino del Piennolo del Vesuvio DOP" },
  { id: 169, angle: "storia", topic: "La 'nduja di Spilinga: dalle origini calabresi al successo nazionale", ingredient: "Nduja di Spilinga" },
  { id: 170, angle: "storia", topic: "Il prosciutto di Parma DOP: una tradizione secolare", ingredient: "Prosciutto di Parma DOP" },
  { id: 171, angle: "storia", topic: "Il culatello di Zibello: il salume nato dalla nebbia della bassa parmense", ingredient: "Culatello di Zibello DOP" },
  { id: 172, angle: "storia", topic: "Lo speck Alto Adige IGP: incontro tra tradizioni italiane e mitteleuropee", ingredient: "Speck Alto Adige IGP" },
  { id: 173, angle: "storia", topic: "La bresaola della Valtellina: storia di un salume di montagna", ingredient: "Bresaola della Valtellina IGP" },
  { id: 174, angle: "storia", topic: "Il provolone del Monaco: perché si chiama così", ingredient: "Provolone del Monaco DOP" },
  { id: 175, angle: "storia", topic: "Il caciocavallo podolico: il formaggio della vacca podolica", ingredient: "Caciocavallo Podolico" },
  { id: 176, angle: "storia", topic: "Il tartufo bianco d'Alba: storia di uno dei prodotti più pregiati al mondo", ingredient: "Tartufo Bianco d'Alba" },
  { id: 177, angle: "storia", topic: "Il tartufo nero di Norcia: tradizione umbra tra bosco e cucina", ingredient: "Tartufo Nero di Norcia" },
  { id: 178, angle: "storia", topic: "Il pistacchio di Bronte: l'oro verde dell'Etna", ingredient: "Pistacchio di Bronte DOP" },
  { id: 179, angle: "storia", topic: "Lo sfusato amalfitano: il limone che profuma la Costiera", ingredient: "Limone Costa d'Amalfi IGP" },
  { id: 180, angle: "storia", topic: "Il limone di Sorrento IGP: storia di un agrume identitario", ingredient: "Limone di Sorrento IGP" },
  { id: 181, angle: "storia", topic: "La cipolla rossa di Tropea: dolcezza che viene dal mare e dal sole calabrese", ingredient: "Cipolla Rossa di Tropea IGP" },
  { id: 182, angle: "storia", topic: "L'aceto balsamico tradizionale di Modena: una tradizione fatta di tempo", ingredient: "Aceto Balsamico Tradizionale di Modena DOP" },
  { id: 183, angle: "storia", topic: "La colatura di alici di Cetara: l'erede della garum romana", ingredient: "Colatura di Alici di Cetara" },
  { id: 184, angle: "storia", topic: "Lo zafferano di San Gimignano: una spezia toscana antica", ingredient: "Zafferano di San Gimignano DOP" },
  { id: 185, angle: "storia", topic: "La farina di castagne della Lunigiana: il pane dei tempi difficili", ingredient: "Farina di Castagne della Lunigiana DOP" },

  // ── gourmet (186-230) ───────────────────────────────────────────────────
  { id: 186, angle: "gourmet", topic: "Abbinamenti non convenzionali con l'alta cucina" },
  { id: 187, angle: "gourmet", topic: "Costruire pizze gourmet stagionali" },
  { id: 188, angle: "gourmet", topic: "L'approccio alla pizza gourmet ma popolare in stile Gabriele Bonci", family: "gabriele-bonci" },
  { id: 189, angle: "gourmet", topic: "\"Meno ingredienti, più qualità\" nella farcitura" },
  { id: 190, angle: "gourmet", topic: "Contaminazioni tra pizza e cucina internazionale" },
  { id: 191, angle: "gourmet", topic: "Impiattare una pizza gourmet pensando ai social" },
  { id: 192, angle: "gourmet", topic: "Pizza dolce: quando ha senso e come farla bene" },
  { id: 193, angle: "gourmet", topic: "Abbinamento vino e pizza gourmet" },
  { id: 194, angle: "gourmet", topic: "Farciture a crudo post-cottura: tecnica e logica" },
  { id: 195, angle: "gourmet", topic: "Pizza vegetariana gourmet senza sembrare un ripiego" },
  { id: 196, angle: "gourmet", topic: "Pizza vegana: farla bene senza snaturare il prodotto" },
  { id: 197, angle: "gourmet", topic: "Abbinamenti di stagione: pizza d'inverno vs pizza d'estate" },
  { id: 198, angle: "gourmet", topic: "Il ruolo della consistenza (crunch) in una farcitura gourmet" },
  { id: 199, angle: "gourmet", topic: "Pizze gourmet a base bianca: quando evitare il pomodoro" },
  { id: 200, angle: "gourmet", topic: "Contrasti dolce-salato in una farcitura ben costruita" },
  { id: 201, angle: "gourmet", topic: "Farciture ispirate ai piatti della tradizione regionale" },
  { id: 202, angle: "gourmet", topic: "Come raccontare una pizza gourmet al cliente al tavolo" },
  { id: 203, angle: "gourmet", topic: "Pizza e birra artigianale: abbinamenti da conoscere" },
  { id: 204, angle: "gourmet", topic: "Guarnizioni a crudo: quando aggiungono valore e quando confondono" },
  { id: 205, angle: "gourmet", topic: "Costruire un menù degustazione di pizze gourmet" },
  { id: 206, angle: "gourmet", topic: "Pizza gourmet in teglia: differenze rispetto alla tonda" },
  { id: 207, angle: "gourmet", topic: "Il ruolo dell'impiattamento nella percezione del prezzo" },
  { id: 208, angle: "gourmet", topic: "Farciture ispirate alla cucina di mare" },
  { id: 209, angle: "gourmet", topic: "Farciture ispirate alla cucina di montagna" },
  { id: 210, angle: "gourmet", topic: "Come evolvere una pizza classica in versione gourmet senza tradirla" },
  { id: 211, angle: "gourmet", topic: "La stracciatella pugliese come topping a crudo: quando usarla", ingredient: "Stracciatella Pugliese" },
  { id: 212, angle: "gourmet", topic: "Il guanciale: come renderlo protagonista di una pizza gourmet", ingredient: "Guanciale Amatriciano" },
  { id: 213, angle: "gourmet", topic: "La 'nduja di Spilinga in pizza: dosare il piccante senza coprire gli altri sapori", ingredient: "Nduja di Spilinga" },
  { id: 214, angle: "gourmet", topic: "I friarielli napoletani: un topping identitario da valorizzare", ingredient: "Friarielli Napoletani" },
  { id: 215, angle: "gourmet", topic: "Il carciofo violetto di Sant'Erasmo: un ingrediente veneziano per una pizza diversa", ingredient: "Carciofo Violetto di Sant'Erasmo" },
  { id: 216, angle: "gourmet", topic: "Il peperone crusco di Senise: croccantezza e colore in farcitura", ingredient: "Peperone di Senise IGP" },
  { id: 217, angle: "gourmet", topic: "I porcini freschi in pizza: quando la stagione lo permette", ingredient: "Funghi Porcini" },
  { id: 218, angle: "gourmet", topic: "Il salame Felino: eleganza salumiera su una base bianca", ingredient: "Salame Felino IGP" },
  { id: 219, angle: "gourmet", topic: "La coppa piacentina a crudo: un classico che funziona sempre", ingredient: "Coppa Piacentina DOP" },
  { id: 220, angle: "gourmet", topic: "La provola dei Nebrodi affumicata: un formaggio che cambia il carattere della pizza", ingredient: "Provola dei Nebrodi" },
  { id: 221, angle: "gourmet", topic: "Il caciocavallo silano fuso: texture e sapore da conoscere", ingredient: "Caciocavallo Silano DOP" },
  { id: 222, angle: "gourmet", topic: "I gamberi rossi di Mazara: eleganza di mare in una pizza gourmet", ingredient: "Gamberi Rossi di Mazara del Vallo" },
  { id: 223, angle: "gourmet", topic: "Il tonno rosso di Favignana: tradizione delle tonnare in chiave contemporanea", ingredient: "Tonno Rosso di Favignana" },
  { id: 224, angle: "gourmet", topic: "La nocciola Piemonte IGP: dal dolce alla farcitura salata", ingredient: "Nocciola Piemonte IGP" },
  { id: 225, angle: "gourmet", topic: "Il pistacchio di Bronte in crema: quando bilancia una farcitura sapida", ingredient: "Pistacchio di Bronte DOP" },
  { id: 226, angle: "gourmet", topic: "Le olive taggiasche: un tocco ligure che non stanca mai", ingredient: "Olive Taggiasche" },
  { id: 227, angle: "gourmet", topic: "Lo zafferano dell'Aquila: come integrarlo in una base per pizza", ingredient: "Zafferano dell'Aquila DOP" },
  { id: 228, angle: "gourmet", topic: "Il miele di castagno: il contrasto amaro-dolce sulla pizza", ingredient: "Miele di Castagno" },
  { id: 229, angle: "gourmet", topic: "Il cipollotto nocerino: dolcezza campana per farciture delicate", ingredient: "Cipollotto Nocerino DOP" },
  { id: 230, angle: "gourmet", topic: "Il baccalà in pizza: una tradizione marinara da riscoprire", ingredient: "Baccalà" },

  // ── miti (231-260) ──────────────────────────────────────────────────────
  { id: 231, angle: "miti", topic: "\"Il forno a legna è sempre meglio dell'elettrico\": vero o falso" },
  { id: 232, angle: "miti", topic: "\"La pizza gourmet è solo marketing\": sfatare il mito" },
  { id: 233, angle: "miti", topic: "\"Più lievitazione lunga è più digeribile\": cosa dice davvero la scienza" },
  { id: 234, angle: "miti", topic: "\"L'acqua della zona cambia tutto\": quanto è vero" },
  { id: 235, angle: "miti", topic: "\"La farina 00 è sempre di bassa qualità\": falso" },
  { id: 236, angle: "miti", topic: "\"Il pomodoro San Marzano è sempre il migliore\": dipende" },
  { id: 237, angle: "miti", topic: "\"Impastare a mano è sempre meglio che con la macchina\": falso" },
  { id: 238, angle: "miti", topic: "\"Più ingredienti, più qualità\": il mito della farcitura abbondante" },
  { id: 239, angle: "miti", topic: "\"La pizza surgelata è sempre peggiore\": non è così semplice" },
  { id: 240, angle: "miti", topic: "\"Il lievito madre è sempre più sano del lievito di birra\": chiarimenti" },
  { id: 241, angle: "miti", topic: "\"Una pizza sottile è sempre più leggera\": falso", family: "pizza-sottile-leggerezza" },
  { id: 242, angle: "miti", topic: "\"Il forno elettrico non può fare una vera napoletana\": falso" },
  { id: 243, angle: "miti", topic: "\"Più tempo di lievitazione è sempre meglio\": non sempre" },
  { id: 244, angle: "miti", topic: "\"La mozzarella filante è sinonimo di qualità\": falso" },
  { id: 245, angle: "miti", topic: "\"Il pane con la crosta dura è sempre più artigianale\": non necessariamente" },
  { id: 246, angle: "miti", topic: "\"Gli impasti a lunga lievitazione costano sempre di più\": dipende" },
  { id: 247, angle: "miti", topic: "\"I grani antichi sono automaticamente più sani\": va contestualizzato", family: "grani-antichi" },
  { id: 248, angle: "miti", topic: "\"Una farina con W alto è sempre la scelta giusta\": dipende dall'uso" },
  { id: 249, angle: "miti", topic: "\"Il glutine è sempre un problema\": chiarire senza allarmismo" },
  { id: 250, angle: "miti", topic: "\"Le pizzerie con più recensioni sono sempre le migliori\": falso" },
  { id: 251, angle: "miti", topic: "\"La vera burrata di Andria si conserva a lungo\": falso, e va bene così", ingredient: "Burrata di Andria IGP" },
  { id: 252, angle: "miti", topic: "\"La bufala va sempre cotta in forno\": dipende dal tipo di pizza", ingredient: "Mozzarella di Bufala Campana DOP" },
  { id: 253, angle: "miti", topic: "\"Il crudo va sempre messo prima della cottura\": falso", ingredient: "Prosciutto di Parma DOP" },
  { id: 254, angle: "miti", topic: "\"Più 'nduja metti, meglio è\": il mito del piccante a tutti i costi", ingredient: "Nduja di Spilinga" },
  { id: 255, angle: "miti", topic: "\"Tutti i pomodorini datterini sono uguali\": falso", ingredient: "Pomodorino del Piennolo del Vesuvio DOP" },
  { id: 256, angle: "miti", topic: "\"I grani antichi siciliani sono tutti uguali\": falso", ingredient: "Farina di Tumminia" },
  { id: 257, angle: "miti", topic: "\"Un olio EVO forte copre sempre il sapore della pizza\": dipende dal dosaggio", ingredient: "Olio EVO Terra di Bari DOP" },
  { id: 258, angle: "miti", topic: "\"L'aceto balsamico va messo solo sui dolci\": falso", ingredient: "Aceto Balsamico Tradizionale di Modena DOP" },
  { id: 259, angle: "miti", topic: "\"Il pecorino è sempre troppo salato per la pizza\": dipende dal bilanciamento", ingredient: "Pecorino Romano DOP" },
  { id: 260, angle: "miti", topic: "\"Il tartufo va sempre grattugiato a crudo\": quasi sempre vero, ma con eccezioni", ingredient: "Tartufo Bianco d'Alba" },

  // ── faq (261-275) ───────────────────────────────────────────────────────
  { id: 261, angle: "faq", topic: "Perché la pizza gourmet costa di più" },
  { id: 262, angle: "faq", topic: "Spiegare i tempi di attesa senza scusarsi" },
  { id: 263, angle: "faq", topic: "Gestire richieste senza glutine in sicurezza" },
  { id: 264, angle: "faq", topic: "Allergie e intolleranze in menù" },
  { id: 265, angle: "faq", topic: "Differenza tra pizza al piatto e pizza al taglio nel servizio" },
  { id: 266, angle: "faq", topic: "Le domande più frequenti al bancone di una pizzeria" },
  { id: 267, angle: "faq", topic: "Perché una pizza sottile non è sempre più leggera", family: "pizza-sottile-leggerezza" },
  { id: 268, angle: "faq", topic: "Cosa chiedere prima di scegliere una pizzeria per un evento" },
  { id: 269, angle: "faq", topic: "Perché due pizze margherita possono avere sapori diversi", family: "pizza-margherita" },
  { id: 270, angle: "faq", topic: "Cosa significa davvero \"pizza artigianale\"" },
  { id: 271, angle: "faq", topic: "Perché alcune pizzerie non fanno le varianti fuori menù" },
  { id: 272, angle: "faq", topic: "Perché il prezzo della pizza asporto è diverso da quella al tavolo" },
  { id: 273, angle: "faq", topic: "Cosa chiedere per capire se una pizzeria usa materie prime di qualità" },
  { id: 274, angle: "faq", topic: "Perché non tutte le pizzerie offrono la pizza senza glutine" },
  { id: 275, angle: "faq", topic: "Come scegliere tra tante pizzerie simili in una città" },

  // ── avviare (276-290) ───────────────────────────────────────────────────
  { id: 276, angle: "avviare", topic: "Errori tipici dei primi mesi di una pizzeria appena aperta" },
  { id: 277, angle: "avviare", topic: "Costruire un business plan realistico per una pizzeria" },
  { id: 278, angle: "avviare", topic: "Scegliere la location giusta: cosa guardare davvero" },
  { id: 279, angle: "avviare", topic: "Percorsi di formazione tecnica per chi vuole diventare pizzaiolo" },
  { id: 280, angle: "avviare", topic: "Quanto costa davvero aprire una pizzeria oggi" },
  { id: 281, angle: "avviare", topic: "Formazione continua: perché un pizzaiolo non smette mai di imparare" },
  { id: 282, angle: "avviare", topic: "Scegliere il concept giusto: pizzeria classica, gourmet o d'asporto" },
  { id: 283, angle: "avviare", topic: "Come valutare la concorrenza prima di aprire" },
  { id: 284, angle: "avviare", topic: "Permessi e burocrazia: cosa sapere prima di aprire" },
  { id: 285, angle: "avviare", topic: "Investimento iniziale in attrezzature: dove non risparmiare" },
  { id: 286, angle: "avviare", topic: "Costruire il primo menù: errori da evitare" },
  { id: 287, angle: "avviare", topic: "Assumere il primo pizzaiolo: cosa valutare davvero" },
  { id: 288, angle: "avviare", topic: "Il periodo di rodaggio: cosa aspettarsi nei primi tre mesi" },
  { id: 289, angle: "avviare", topic: "Quando conviene affiancarsi a un consulente prima di aprire" },
  { id: 290, angle: "avviare", topic: "Trasformare una passione in un mestiere sostenibile" },

  // ── vita (291-300) ──────────────────────────────────────────────────────
  { id: 291, angle: "vita", topic: "Una giornata tipo dietro le quinte di una pizzeria" },
  { id: 292, angle: "vita", topic: "Aneddoti personali dal mestiere di consulente pizzaiolo" },
  { id: 293, angle: "vita", topic: "Il rapporto tra un pizzaiolo e il proprio forno" },
  { id: 294, angle: "vita", topic: "Cosa si impara solo stando dietro al banco, non sui libri" },
  { id: 295, angle: "vita", topic: "Il momento più difficile della giornata in una pizzeria" },
  { id: 296, angle: "vita", topic: "La soddisfazione di vedere un cliente tornare per la terza volta" },
  { id: 297, angle: "vita", topic: "Cosa significa davvero \"saper leggere un impasto\"" },
  { id: 298, angle: "vita", topic: "Il valore del tempo in un mestiere fatto di attesa" },
  { id: 299, angle: "vita", topic: "Consigli che darei a un giovane che vuole fare questo mestiere" },
  { id: 300, angle: "vita", topic: "Perché ogni pizza racconta qualcosa di chi la fa" },
];

function getFamily(topic: Topic): string | undefined {
  return topic.family ?? topic.ingredient;
}

// Due argomenti diversi possono comunque parlare dello stesso soggetto (es. "Il sale" e
// "Il sale marino di Trapani"): la rotazione da sola non lo vede perché confronta solo il
// testo esatto. Questo è il tempo minimo che deve passare da un argomento della stessa
// famiglia prima che un altro membro della stessa famiglia possa uscire.
const FAMILY_COOLDOWN_MS = 21 * 24 * 60 * 60 * 1000;

// Sceglie l'argomento standalone da assegnare (rotazione forzata, non è una scelta di Claude):
// prima quelli mai usati (con priorità a quelli la cui famiglia tematica non è "in
// raffreddamento"), poi quello usato meno di recente in assoluto. Il match sul singolo
// argomento è per testo esatto (colonna social_posts.subtopic), garantendo un ciclo pieno
// sui 300 argomenti prima di qualunque ripetizione; il raffreddamento per famiglia previene
// invece che due argomenti affini (stesso ingrediente o soggetto specifico, angolo diverso)
// escano a distanza ravvicinata.
export async function pickNextTopic(): Promise<Topic> {
  const { data } = await supabase
    .from("social_posts")
    .select("subtopic, created_at")
    .order("created_at", { ascending: false });

  const lastUsedAt = new Map<string, string>();
  for (const row of data ?? []) {
    if (!row.subtopic) continue;
    if (!lastUsedAt.has(row.subtopic)) lastUsedAt.set(row.subtopic, row.created_at);
  }

  const topicByText = new Map(TOPICS.map((t) => [t.topic, t]));
  const familyLastUsedAt = new Map<string, string>();
  for (const [subtopicText, createdAt] of lastUsedAt) {
    const family = getFamily(topicByText.get(subtopicText) ?? ({} as Topic));
    if (!family) continue;
    const prev = familyLastUsedAt.get(family);
    if (!prev || createdAt > prev) familyLastUsedAt.set(family, createdAt);
  }

  const now = Date.now();
  const isFamilyCoolingDown = (topic: Topic) => {
    const family = getFamily(topic);
    if (!family) return false;
    const last = familyLastUsedAt.get(family);
    if (!last) return false;
    return now - new Date(last).getTime() < FAMILY_COOLDOWN_MS;
  };

  const neverUsed = TOPICS.filter((t) => !lastUsedAt.has(t.topic));
  if (neverUsed.length > 0) {
    const neverUsedFresh = neverUsed.filter((t) => !isFamilyCoolingDown(t));
    // Se il raffreddamento per famiglia svuota il pool (capita solo con poche famiglie
    // rimaste tutte "calde"), meglio ripiegare su un argomento mai usato comunque piuttosto
    // che bloccare la generazione.
    const pool = neverUsedFresh.length > 0 ? neverUsedFresh : neverUsed;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  const sorted = [...TOPICS].sort((a, b) => {
    const at = lastUsedAt.get(a.topic) ?? "";
    const bt = lastUsedAt.get(b.topic) ?? "";
    return at.localeCompare(bt);
  });
  return sorted[0];
}
