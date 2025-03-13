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
        altezzaDinamicaPresenze = 500;  // Altezza aumentata per mobile
    } else {
        altezzaDinamicaPresenze = Math.min(800, Math.max(400, top10Presenze.length * 50));
    }
    chartPresenzeCanvas.style.height = altezzaDinamicaPresenze + "px";

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
                    "rgba(255, 99, 132, 0.6)",
                    "rgba(54, 162, 235, 0.6)",
                    "rgba(255, 206, 86, 0.6)",
                    "rgba(75, 192, 192, 0.6)",
                    "rgba(153, 102, 255, 0.6)"
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
                barThickness: 30
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
