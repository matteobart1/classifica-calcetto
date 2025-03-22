function doGet(e) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();
    
    var presenze = {};

    for (var i = 1; i < data.length; i++) {
        var dataPartita = data[i][0];  // Data
        var nome = data[i][1];  // Nome giocatore
        var presente = data[i][2];  // Presenza (Sì/No)
        var immagine = data[i][3];  // URL immagine
        var vittoria = data[i][4];  // Vittoria (Sì/No)
        var reti = data[i][5] || 0;  // Reti segnate (default 0 se vuoto)
        
        if (presente.toLowerCase().trim() === "sì") {
            if (!presenze[nome]) {
                presenze[nome] = { 
                    presenze: 0, 
                    prima: dataPartita, 
                    ultima: dataPartita, 
                    immagine: immagine,
                    vittorie: 0,
                    reti: 0,
                    recordGolSingolaPartita: 0  // Inizializza il record di gol in una singola partita
                };
            }

            presenze[nome].presenze++;

            // Conta la vittoria solo se è "Sì"
            if (vittoria.toLowerCase().trim() === "sì") {
                presenze[nome].vittorie++;
            }

            // Somma i gol segnati
            var golPartita = parseInt(reti) || 0;
            presenze[nome].reti += golPartita;

            // Aggiorna il record di gol in una singola partita
            if (golPartita > presenze[nome].recordGolSingolaPartita) {
                presenze[nome].recordGolSingolaPartita = golPartita;
            }

            // Aggiorna la prima e l'ultima partecipazione
            if (new Date(dataPartita) < new Date(presenze[nome].prima)) {
                presenze[nome].prima = dataPartita;
            }
            if (new Date(dataPartita) > new Date(presenze[nome].ultima)) {
                presenze[nome].ultima = dataPartita;
            }
        }
    }
    
    var classifica = Object.entries(presenze)
        .sort((a, b) => b[1].presenze - a[1].presenze)
        .map(([nome, dati]) => ({
            nome: nome,
            presenze: dati.presenze,
            prima: dati.prima,
            ultima: dati.ultima,
            immagine: dati.immagine,
            vittorie: dati.vittorie,
            reti: dati.reti,
            recordGolSingolaPartita: dati.recordGolSingolaPartita  // Aggiungi il record di gol in una singola partita
        }));

    var output = ContentService.createTextOutput(JSON.stringify(classifica));
    output.setMimeType(ContentService.MimeType.JSON);
    
    return output;
} 