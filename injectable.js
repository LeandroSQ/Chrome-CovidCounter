const API_ENDPOINT = `/prod/portalcasos`;
const CARD_TEMPLATE = 
    `<div {{id}} class="card-total tp-geral teste">
        <div {{id}} class="lb-title tp-geral {{color}}">
            <span {{id}}>{{title}}</span>
        </div>
        <div {{id}} class="ct-info display-flex justify-start">
            <div {{id}} class="lb-total tp-geral width-auto fnt-size">
                {{value}} <span {{id}} class="lb-percent"></span>
                <br {{id}}/>
                <span {{id}}>{{description}}</span>
            </div>
        </div>
    </div>`;
const INFO_CARD_TEMPLATE =
    `<div {{id}} class="card-total tp-sobre" style="width: 100%; max-width: 100%;">
        <b {{id}}>{{title}}</b>
        <p {{id}}>{{description}}</p>
    </div>`;

// Let's just override the method, so we won't generate more traffic to their servers!
function overrideHttpRequestPrototype () {
    // Save the original function in a 'proxy' variable
    let original = window.XMLHttpRequest.prototype.send;

    // Override it
    window.XMLHttpRequest.prototype.send = function() {
        console.info("[COVID-COUNTER] Intercepting request...");

        // Appends an event to the stack
        this.addEventListener("readystatechange", function(e) {
            // Check if the response was successful
            if (this.readyState === 4 && this.status === 200) {
                // Check for the wanted API endpoint
                if (this.__zone_symbol__xhrURL.toLowerCase().endsWith(API_ENDPOINT)) {
                    // Parse the responseText and send it to the event handler!
                    let response = JSON.parse(this.responseText);
                    onResponse(response);
                }
            }
        });

        // Route back to the original function
        return original.apply(this, [...arguments]);
    };
}

/***
 * This function extract the unique angular id of the element 
 ***/
function extractAngularId(element) {
    return element.getAttributeNames()
                  .filter(x => x !== "class")
                  .find(x => x);
}

function createCard(id, title, description, value, color="") {
    // Replace the slots on the string template
    return CARD_TEMPLATE.replace(/\{\{id\}\}/gi, id)
                        .replace(/\{\{title\}\}/gi, title)
                        .replace(/\{\{value\}\}/gi, value.toLocaleString())
                        .replace(/\{\{color\}\}/gi, color)
                        .replace(/\{\{description\}\}/gi, description);
}

function createInfoCard(id, title, description) {
    // Replace the slots on the string template
    return INFO_CARD_TEMPLATE.replace(/\{\{id\}\}/gi, id)
                             .replace(/\{\{title\}\}/gi, title)
                             .replace(/\{\{description\}\}/gi, description);
}

function createFlexBreak() {
    let element = document.createElement("div");
    element.style.flexBasis = `100%`;
    element.style.width = `0`;

    return element;
}

function createCardContainer(id) {
    let element = document.createElement("div");
    element.className = `container-cards ct-totalizadores ct-geral`;
    element.setAttribute(id, "");

    return element;
}

function onResponse(response) {
    console.info("[COVID-COUNTER] Treating intercepted response...");

    let statistics = response.dias[response.dias.length - 1];
    console.log("Statistics -> ", statistics);

    // Grab the first card container
    let mirrorContainer = document.querySelector(`.container-cards.ct-totalizadores.ct-geral`);
    // Grab it's parent
    let containerParent = mirrorContainer.parentElement;
    // Extract the unique angular id of the mirror container, to apply on our new container
    let angularId = extractAngularId(mirrorContainer);
    // Creates a new card container
    let container = createCardContainer(angularId);
    // Appends it to the container parent
    containerParent.appendChild(container);    
    
    // Generates a card from the template
    let deathsCard = createCard(angularId, "Total óbitos", "Quantidade de óbitos acumulados", statistics.obitosAcumulado);
    // Insert it on the end of the container
    container.insertAdjacentHTML("beforeend", deathsCard);
    
    // Generates a card from the template
    let casesCard = createCard(angularId, "Total confirmados", "Quantidade de casos acumulados", statistics.casosAcumulado, "color-secondary");
    // Insert it on the end of the container
    container.insertAdjacentHTML("beforeend", casesCard);
    
    // Generates a card from the template
    let infoCard = createInfoCard(angularId, "Transparece Brasil", "Todos os dados apresentados aqui são recuperados pelos relatórios do próprio ministério da saúde");
    // Insert it on the end of the container
    container.insertAdjacentHTML("beforeend", infoCard);
}

console.info("[COVID-COUNTER] Initializing...");

// Inject a http-interceptor
overrideHttpRequestPrototype();