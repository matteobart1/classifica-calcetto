async function caricaClassifica() {
    const url = "https://script.google.com/macros/s/AKfycbxJxBo8Xf4jXQoMpHVbvMVhuoDsNNHjLGXrAA9vLkEHp-ASJgK4WW14xXcsxICSWQYR1g/exec";
    const badgeURL = "https://res.cloudinary.com/dp44j757l/image/upload/v1741736096/SenatorBadge_a7jkzn.png";

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Errore HTTP! Status: ${response.status}`);

        const data = await response.json();
        console.log("Dati ricevuti:", data);

        let htmlPresenze = "";
        let htmlReti = "";
        let htmlVittorie = "";

        // Generazione tabella presenze (mantiene l'ordine originale o quello stabilito dal backend)
        data.forEach((giocatore, index) => {
            const badge = index < 5 ? `<img src="${badgeURL}" class="badge">` : "";
            htmlPresenze += `<tr>
                        <td>${index + 1}</td>
                        <td>
                            <div class="player-container">
                                <img src="${giocatore.immagine}" class="player-img" alt="${giocatore.nome}">
                                ${badge}
                            </div>
                        </td>
                        <td>${giocatore.nome}</td>
                        <td>${giocatore.presenze}</td>
                        <td>${new Date(giocatore.prima).toLocaleDateString()}</td>
                        <td>${new Date(giocatore.ultima).toLocaleDateString()}</td>
                     </tr>`;
        });

        // Generazione tabella reti: filtra solo i giocatori con almeno 1 rete, ordina in modo decrescente
        data
            .filter(g => g.reti > 0)
            .sort((a, b) => b.reti - a.reti)
            .forEach((giocatore, index) => {
                htmlReti += `<tr>
                        <td>${index + 1}</td>
                        <td>
                            <div class="player-container">
                                <img src="${giocatore.immagine}" class="player-img" alt="${giocatore.nome}">
                            </div>
                        </td>
                        <td>${giocatore.nome}</td>
                        <td>${giocatore.reti}</td>
                     </tr>`;
            });

        // Generazione tabella vittorie: filtra solo i giocatori con almeno 1 vittoria, ordina in modo decrescente
        data
            .filter(g => g.vittorie > 0)
            .sort((a, b) => b.vittorie - a.vittorie)
            .forEach((giocatore, index) => {
                htmlVittorie += `<tr>
                        <td>${index + 1}</td>
                        <td>
                            <div class="player-container">
                                <img src="${giocatore.immagine}" class="player-img" alt="${giocatore.nome}">
                            </div>
                        </td>
                        <td>${giocatore.nome}</td>
                        <td>${giocatore.vittorie}</td>
                     </tr>`;
            });

        document.getElementById("classifica").innerHTML = htmlPresenze;
        document.getElementById("classifica-reti").innerHTML = htmlReti;
        document.getElementById("classifica-vittorie").innerHTML = htmlVittorie;

        generaGrafici(
            data.map(g => g.nome),
            data.map(g => g.presenze),
            data.map(g => g.reti),
            data.map(g => g.vittorie)
        );

    } catch (error) {
        console.error("Errore nel recupero dati:", error);
        document.getElementById("loading").innerText = "Errore nel caricamento!";
    } finally {
        document.getElementById("loading").style.display = "none";
    }
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

    let datasetPresenze = {
        label: "Presenze",
        data: presenzeFiltrate,
        backgroundColor: "rgba(0, 123, 255, 0.6)",
        borderColor: "rgba(0, 123, 255, 1)",
        borderWidth: 1
    };
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

caricaClassifica();


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

  window.addEventListener('load', function() {
    // Nasconde il loader al termine del caricamento della pagina
    const loaderContainer = document.getElementById('loader-container');
    loaderContainer.style.display = 'none';
  });
  