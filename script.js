async function caricaClassifica() {
    const url = "https://script.google.com/macros/s/AKfycbxf-KuK5WroV80q5WW7BVpTdtLKxv9bhuwckXlRz46r9ycWqDdN_obvVs4v2Agg2xPiMQ/exec";
    const badgeURL = "https://res.cloudinary.com/dp44j757l/image/upload/v1741736096/SenatorBadge_a7jkzn.png";
    const badgeBomberURL = "https://res.cloudinary.com/dp44j757l/image/upload/v1742666297/BadgeBomber_ujw3ww.png"; 
    const badgeCapocannoniereURL = "https://res.cloudinary.com/dp44j757l/image/upload/v1742664480/Badge_Goleador_darelx.png";

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Errore HTTP! Status: ${response.status}`);

        const data = await response.json();
        console.log("Dati ricevuti:", data);

        // Mostra il contenuto principale
        document.getElementById('content').classList.remove('hidden');

        let htmlPresenze = "";
        let htmlReti = "";
        let htmlVittorie = "";

        // Trova il massimo numero di gol in assoluto
        const maxGolAssoluto = Math.max(...data.map(g => g.reti));

        // Trova il massimo numero di gol in una singola partita
        const maxGolSingolaPartita = Math.max(...data.map(g => g.recordGolSingolaPartita || 0));

        // Generazione tabella presenze (mantiene l'ordine originale o quello stabilito dal backend)
        data.forEach((giocatore, index) => {
            const badge = index < 5 ? `<div class="flex items-center justify-center w-full">
                <div class="flex flex-col items-center justify-center w-10 h-14">
                    <img src="${badgeURL}" class="w-8 h-8" alt="Badge Senatore">
                </div>
            </div>` : "";
            htmlPresenze += `<tr class="border-b border-gray-200">
                        <td class="align-middle">${index + 1}</td>
                        <td class="align-middle">
                            <div class="flex items-center justify-center w-16 h-16">
                                <img src="${giocatore.immagine}" class="w-14 h-14 min-w-[3.5rem] min-h-[3.5rem] rounded-full object-cover border-2 border-gray-300 shadow-md" alt="${giocatore.nome}">
                            </div>
                        </td>
                        <td class="align-middle">${badge}</td>
                        <td class="align-middle">${giocatore.nome}</td>
                        <td class="align-middle">${giocatore.presenze}</td>
                        <td class="align-middle">${new Date(giocatore.prima).toLocaleDateString()}</td>
                        <td class="align-middle">${new Date(giocatore.ultima).toLocaleDateString()}</td>
                     </tr>`;
        });

        // Generazione tabella reti: filtra solo i giocatori con almeno 1 rete, ordina in modo decrescente
        data
            .filter(g => g.reti > 0)
            .sort((a, b) => b.reti - a.reti)
            .forEach((giocatore, index) => {
                const partiteConEsito = giocatore.vittorie + giocatore.sconfitte;
                const mediaGol = partiteConEsito > 0 
                    ? (giocatore.reti / partiteConEsito).toFixed(1).replace('.0', '') 
                    : "0";
                
                // Gestione dei badge
                let badges = [];
                if (giocatore.reti === maxGolAssoluto) {
                    badges.push(`<div class="flex flex-col items-center justify-center w-10 h-14">
                        <img src="${badgeCapocannoniereURL}" class="w-8 h-8" alt="Badge Capocannoniere">
                    </div>`);
                }
                if (giocatore.recordGolSingolaPartita === maxGolSingolaPartita) {
                    badges.push(`<div class="flex flex-col items-center justify-center w-10 h-14">
                        <img src="${badgeBomberURL}" class="w-8 h-8" alt="Badge Bomber">
                        <span class="mt-1 bg-primary text-white text-xs px-1.5 py-0.5 rounded-full border border-gray-300">${giocatore.recordGolSingolaPartita}</span>
                    </div>`);
                }

                const badgeHTML = badges.length > 0 
                    ? `<div class="flex items-center ${badges.length === 1 ? 'justify-center' : 'justify-center'} w-full gap-1">${badges.join('')}</div>`
                    : '';

                htmlReti += `<tr class="border-b border-gray-200">
                        <td class="align-middle">${index + 1}</td>
                        <td class="align-middle">
                            <div class="flex items-center justify-center w-16 h-16">
                                <img src="${giocatore.immagine}" class="w-14 h-14 min-w-[3.5rem] min-h-[3.5rem] rounded-full object-cover border-2 border-gray-300 shadow-md" alt="${giocatore.nome}">
                            </div>
                        </td>
                        <td class="align-middle">${badgeHTML}</td>
                        <td class="align-middle">${giocatore.nome}</td>
                        <td class="align-middle">${giocatore.reti}</td>
                        <td class="align-middle">${mediaGol}</td> 
                    </tr>`;
            });
        // Generazione tabella vittorie: filtra solo i giocatori con almeno 1 vittoria o 1 sconfitta, ordina in modo decrescente
        data
            .filter(g => g.vittorie > 0 || g.sconfitte > 0)
            .sort((a, b) => b.vittorie - a.vittorie)
            .forEach((giocatore, index) => {
                const partiteConEsito = giocatore.vittorie + giocatore.sconfitte;
                const percVittorie = partiteConEsito > 0 ? Math.round((giocatore.vittorie / partiteConEsito) * 100) : 0;
                const percSconfitte = 100 - percVittorie;
                htmlVittorie += `<tr class="border-b border-gray-200">
                        <td class="align-middle">${index + 1}</td>
                        <td class="align-middle">
                            <div class="flex items-center justify-center w-16 h-16">
                                <img src="${giocatore.immagine}" class="w-14 h-14 min-w-[3.5rem] min-h-[3.5rem] rounded-full object-cover border-2 border-gray-300 shadow-md" alt="${giocatore.nome}">
                            </div>
                        </td>
                        <td class="align-middle">${giocatore.nome}</td>
                        <td class="align-middle">${giocatore.vittorie}</td>
                        <td class="align-middle">${percVittorie}%</td>
                        <td class="align-middle">${giocatore.sconfitte}</td>
                        <td class="align-middle">${percSconfitte}%</td>
                        <td class="align-middle">${giocatore.maxVittorieConsecutive}</td>
                        <td class="align-middle">${giocatore.maxSconfitteConsecutive}</td>
                    </tr>`;
            });
         // Inserimento dati nel DOM
         document.getElementById("tbody-presenze").innerHTML = htmlPresenze;
         document.getElementById("tbody-reti").innerHTML = htmlReti;
         document.getElementById("tbody-vittorie").innerHTML = htmlVittorie;

         // Aggiungi indicatore di scroll orizzontale per mobile
         const tables = document.querySelectorAll('.overflow-x-auto');
         tables.forEach(table => {
             const scrollIndicator = document.createElement('div');
             scrollIndicator.className = 'md:hidden flex items-center justify-center gap-2 py-2 bg-gray-100 text-gray-600 text-sm';
             scrollIndicator.innerHTML = `
                 <svg class="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                 </svg>
                 <span>Scorri orizzontalmente per vedere tutte le colonne</span>
             `;
             table.parentNode.insertBefore(scrollIndicator, table);
         });

         // Rendi le tabelle ordinabili
        rendiTabellaOrdinabile("classifica-presenze");
        rendiTabellaOrdinabile("classifica-reti");
        rendiTabellaOrdinabile("classifica-vittorie");


        generaGrafici(
            data.map(g => g.nome),
            data.map(g => g.presenze),
            data.map(g => g.reti),
            data.map(g => g.vittorie)
        );

    } catch (error) {
        console.error("Errore nel recupero dati:", error);
        // Mostra un messaggio di errore all'utente
        const content = document.getElementById('content');
        content.classList.remove('hidden');
        content.innerHTML = '<div class="text-red-600 text-xl p-4">Errore nel caricamento dei dati. Riprova più tardi.</div>';
    } finally {
        // Nascondi il loader
        const loaderContainer = document.getElementById('loader-container');
        loaderContainer.style.display = 'none';
    }
}

// Funzioni per ordinare le tabelle
function rendiTabellaOrdinabile(idTabella) {
    const tabella = document.getElementById(idTabella);
    const intestazioni = tabella.querySelectorAll("th");
    let direzioni = Array.from(intestazioni).map(() => true);

    intestazioni.forEach((th, indice) => {
        th.style.cursor = "pointer";
        // Aggiungo classi Tailwind per lo stile delle intestazioni
        th.classList.add(
            "bg-gray-200",  // Sfondo più scuro
            "font-semibold", 
            "text-gray-800",  // Testo più scuro per maggiore contrasto
            "border-b-2", 
            "border-gray-400",  // Bordo più scuro
            "hover:bg-gray-300",  // Hover più scuro
            "transition-colors", 
            "duration-150", 
            "py-3",
            "px-4",
            "text-center",  // centra il testo
            "align-middle", // allinea verticalmente al centro
            "break-words"   // permette il wrapping delle parole
        );
        th.addEventListener("click", () => {
            ordinaTabellaPerColonna(tabella, indice, direzioni[indice]);
            direzioni[indice] = !direzioni[indice];
        });
    });
}

// Funzione di ordinamento generico
function ordinaTabellaPerColonna(tabella, colonna, crescente) {
    const tbody = tabella.tBodies[0];
    const righe = Array.from(tbody.querySelectorAll("tr"));

    righe.sort((a, b) => {
        const testoA = a.children[colonna].textContent.trim();
        const testoB = b.children[colonna].textContent.trim();

        const valoreA = isNaN(testoA.replace("%","")) ? testoA : parseFloat(testoA.replace("%",""));
        const valoreB = isNaN(testoB.replace("%","")) ? testoB : parseFloat(testoB.replace("%",""));

        if (valoreA < valoreB) return crescente ? -1 : 1;
        if (valoreA > valoreB) return crescente ? 1 : -1;
        return 0;
    });

    righe.forEach(riga => tbody.appendChild(riga));
}



function generaGrafici(nomi, presenze, reti, vittorie) {
    // Grafico Presenze: Ordiniamo i giocatori per presenze e prendiamo solo i primi 10
    const top10Presenze = nomi.map((nome, index) => ({
        nome: nome,
        presenze: presenze[index]
    })).sort((a, b) => b.presenze - a.presenze)
      .slice(0, 10);

    const nomiPresenze = top10Presenze.map(g => g.nome);
    const presenzeFiltrate = top10Presenze.map(g => g.presenze);

    // Grafico Reti: Filtriamo i giocatori con almeno 1 rete, ordiniamo in modo decrescente e prendiamo i primi 10
    const giocatoriConReti = nomi.map((nome, index) => ({
        nome: nome,
        reti: reti[index]
    })).filter(giocatore => giocatore.reti > 0);
    const top10Reti = giocatoriConReti.sort((a, b) => b.reti - a.reti).slice(0, 10);
    const nomiFiltratiReti = top10Reti.map(g => g.nome);
    const retiFiltrate = top10Reti.map(g => g.reti);

    // Grafico Vittorie: Ordiniamo i giocatori per vittorie in modo decrescente e prendiamo i primi 10
    const top10Vittorie = nomi.map((nome, index) => ({
        nome: nome,
        vittorie: vittorie[index]
    })).sort((a, b) => b.vittorie - a.vittorie)
      .slice(0, 10);

    const nomiVittorie = top10Vittorie.map(g => g.nome);
    const vittorieFiltrate = top10Vittorie.map(g => g.vittorie);

    // Grafico delle Presenze (solo top 10)
    const chartPresenzeCanvas = document.getElementById("chartPresenze");
    let altezzaDinamicaPresenze;
    if (window.innerWidth < 768) {
        // Per mobile: aumenta l'altezza per visualizzare meglio le barre
        altezzaDinamicaPresenze = Math.max(250, top10Presenze.length * 50);
    } else {
        altezzaDinamicaPresenze = Math.min(800, Math.max(400, top10Presenze.length * 50));
    }
    // Imposta lo stile e l'attributo height del canvas
    chartPresenzeCanvas.style.height = altezzaDinamicaPresenze + "px";
    chartPresenzeCanvas.setAttribute("height", altezzaDinamicaPresenze);

    // Configurazione del dataset per il grafico delle presenze
    // Imposta colori, bordi e spessore delle barre
    let datasetPresenze = {
        label: "Presenze",
        data: presenzeFiltrate,
        backgroundColor: "rgba(0, 123, 255, 0.6)", // Colore di riempimento blu semi-trasparente
        borderColor: "rgba(0, 123, 255, 1)", // Bordo blu pieno
        borderWidth: 1 // Spessore bordo di 1px
    };
    // Per schermi desktop (>= 768px) imposta uno spessore fisso delle barre
    if (window.innerWidth >= 768) {
        datasetPresenze.barThickness = 30;
    }

    new Chart(chartPresenzeCanvas, {
        type: "bar",
        data: {
            labels: nomiPresenze,
            datasets: [datasetPresenze]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: "Classifica Presenze - Top 10",
                    font: { size: 18 }
                }
            },
            scales: {
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        font: { size: 12 }
                    }
                },
                y: { beginAtZero: true }
            }
        }
    });

    // Grafico delle Reti (solo top 10)
    const totaleReti = retiFiltrate.reduce((sum, r) => sum + r, 0);
    new Chart(document.getElementById("chartReti"), {
        type: "pie",
        data: {
            labels: nomiFiltratiReti,
            datasets: [{
                label: "Reti",
                data: retiFiltrate,
                backgroundColor: [
                    
                    
                    "rgba(0, 123, 255, 0.8)",  // Blu Primario
                    "rgba(0, 86, 179, 0.8)",   // Blu Scuro
                    "rgba(40, 167, 69, 0.8)",  // Verde Campo
                    "rgba(255, 193, 7, 0.8)",  // Giallo Oro
                    "rgba(220, 53, 69, 0.8)",  // Rosso Vivace
                    "rgba(253, 126, 20, 0.8)", // Arancione Energetico
                    "rgba(23, 162, 184, 0.8)", // Ciano Fresco
                    "rgba(111, 66, 193, 0.8)", // Viola Intenso
                    "rgba(108, 117, 125, 0.8)",// Grigio Neutro
                    "rgba(247, 243, 9, 0.93)" // Bianco Sporco / Grigio Chiaro



                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: "Distribuzione delle Reti - Top 10",
                    font: { size: 18 }
                },
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem) {
                            const index = tooltipItem.dataIndex;
                            const rete = retiFiltrate[index];
                            const percentuale = ((rete / totaleReti) * 100).toFixed(1);
                            return `${nomiFiltratiReti[index]}: ${rete} gol (${percentuale}%)`;
                        }
                    }
                }
            }
        }
    });

    // Grafico delle Vittorie (solo top 10)
    const chartVittorieCanvas = document.getElementById("chartVittorie");
    const altezzaDinamicaVittorie = Math.min(800, Math.max(400, top10Vittorie.length * 50));
    chartVittorieCanvas.style.height = altezzaDinamicaVittorie + "px";

    new Chart(chartVittorieCanvas, {
        type: "bar",
        data: {
            labels: nomiVittorie,
            datasets: [{
                label: "Vittorie",
                data: vittorieFiltrate,
                backgroundColor: "rgba(40, 167, 69, 0.6)",
                borderColor: "rgba(40, 167, 69, 1)",
                borderWidth: 1,
                barThickness: 22
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                title: {
                    display: true,
                    text: "Classifica Vittorie - Top 10",
                    font: { size: 18 }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        precision: 0
                    }
                },
                y: {
                    ticks: {
                        font: { size: 14 }
                    }
                }
            }
        }
    });


}

// Avvia il caricamento dei dati quando la pagina è pronta
document.addEventListener('DOMContentLoaded', caricaClassifica);

document.addEventListener("DOMContentLoaded", () => {
    const versionIndicator = document.getElementById("version-indicator");
  
    // Sostituisci "tuoUtente" e "tuoRepo" con i dati del tuo repository
    fetch("https://api.github.com/repos/matteobart1/classifica-calcetto/commits?per_page=1")
      .then(response => response.json())
      .then(data => {
        if (data && data.length > 0) {
          const commit = data[0];
          const commitHash = commit.sha.substring(0, 7); // Prendi i primi 7 caratteri
          // Estrai la data del commit
          const commitDate = new Date(commit.commit.committer.date);
          // Formatta la data come preferisci, ad esempio con toLocaleString()
          const formattedDate = commitDate.toLocaleString();
          versionIndicator.innerText = `Versione: ${commitHash} (commit del ${formattedDate})`;
        } else {
          versionIndicator.innerText = "Versione: non disponibile";
        }
      })
      .catch(error => {
        console.error("Errore nel recupero della versione:", error);
        versionIndicator.innerText = "Versione: errore";
      });
  });

  
  
  // Rimuovo l'event listener del load che non è più necessario
  // window.addEventListener('load', function() {
  //     const loaderContainer = document.getElementById('loader-container');
  //     loaderContainer.style.display = 'none';
  // });


  