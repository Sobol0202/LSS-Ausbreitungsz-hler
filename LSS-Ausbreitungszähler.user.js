// ==UserScript==
// @name         LSS-Ausbreitungszähler
// @namespace    https://www.leitstellenspiel.de/
// @version      1.0
// @description  Zählt Ausbreitungssprechwünsche und zeigt einen Zähler an
// @author       MissSobol
// @match        https://www.leitstellenspiel.de/
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // Überprüfe, ob der Browser Local Storage unterstützt
    if (typeof(Storage) === 'undefined') {
        console.error('Der Browser unterstützt den Local Storage nicht.');
        return;
    }

    // Erstelle oder aktualisiere den Zähler im Local Storage
    if (!localStorage.sprechwunschZaehler) {
        localStorage.sprechwunschZaehler = 0;
    }

    // Funktion zum Inkrementieren des Zählers und Aktualisieren der Anzeige
    function erhoeheZaehler() {
        localStorage.sprechwunschZaehler++;
        document.getElementById('sprechwunsch-zaehler').textContent = localStorage.sprechwunschZaehler;
        console.log('Zähler erhöht. Aktueller Wert: ' + localStorage.sprechwunschZaehler);
    }

    // Füge den Zähler zum Hauptmenü hinzu
    const navbarHeader = document.querySelector('.navbar-header');
    if (navbarHeader) {
        const zaehlerElement = document.createElement('span');
        zaehlerElement.id = 'sprechwunsch-zaehler';
        zaehlerElement.textContent = localStorage.sprechwunschZaehler;
        zaehlerElement.style.cursor = 'pointer';
        zaehlerElement.style.marginLeft = '10px';
        zaehlerElement.style.position = 'relative';
        zaehlerElement.style.top = '50%';
        zaehlerElement.style.transform = 'translateY(-50%)';
        zaehlerElement.addEventListener('click', zuruecksetzenZaehler);
        navbarHeader.appendChild(zaehlerElement);
    } else {
        console.error('Das Element mit der Klasse "navbar-header" wurde nicht gefunden.');
    }

    // Funktion zum Zurücksetzen des Zählers und Aktualisieren der Anzeige
    function zuruecksetzenZaehler() {
        localStorage.sprechwunschZaehler = 0;
        document.getElementById('sprechwunsch-zaehler').textContent = localStorage.sprechwunschZaehler;
        console.log('Zähler zurückgesetzt. Aktueller Wert: ' + localStorage.sprechwunschZaehler);
    }

    // Überwache das Erscheinen neuer Sprechwünsche
    if (window.location.href === 'https://www.leitstellenspiel.de/') {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                const nodes = mutation.addedNodes;
                for (let i = 0; i < nodes.length; i++) {
                    const node = nodes[i];
                    if (node.tagName === 'LI' && node.matches('[class^="radio_message_vehicle"]')) {
                        const text = node.textContent.toLowerCase();
                        if (text.includes('ausgebreitet')) {
                            console.log('Neuer Sprechwunsch mit "ausgebreitet" erfasst.');
                            erhoeheZaehler();
                        }
                    }
                }
            });
        });

        // Überwache Änderungen im Bereich der Sprechwünsche
        const targetNode = document.getElementById('radio_outer');
        if (targetNode) {
            const observerConfig = { childList: true, subtree: true };
            const radioPanelBody = targetNode.querySelector('.panel.panel-default #radio_panel_body');
            if (radioPanelBody) {
                observer.observe(radioPanelBody, observerConfig);
            } else {
                console.error('Das Element mit der ID "radio_panel_body" wurde nicht gefunden.');
            }

            // Zähle bereits vorhandene Sprechwünsche beim initialen Laden der Seite
            const existingRadioMessages = targetNode.querySelectorAll('#radio_messages_important li[class^="radio_message_vehicle"]');
            existingRadioMessages.forEach(function(message) {
                const text = message.textContent.toLowerCase();
                if (text.includes('ausgebreitet')) {
                    console.log('Bereits vorhandener Sprechwunsch mit "ausgebreitet" erfasst.');
                    erhoeheZaehler();
                }
            });
        } else {
            console.error('Das Element mit der ID "radio_outer" wurde nicht gefunden.');
        }
    }
})();
