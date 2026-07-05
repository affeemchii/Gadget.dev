(function () {
  'use strict';

  // Fetch settings from the endpoint and render the button if enabled
  function init() {
    fetch('https://whatsapp-chat-button--development.gadget.app/whatsapp-settings')
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(function (settings) {
        // If settings exist, are enabled, and have a phone number, render the button
        if (settings && settings.isEnabled && settings.whatsappNumber) {
          createWhatsAppButton(settings);
        }
      })
      .catch(function (error) {
        // Handle all errors silently to avoid breaking the storefront
      });
  }

  /**
   * Create and inject the floating WhatsApp button into the DOM
   * @param {any} settings
   */
  function createWhatsAppButton(settings) {
    var whatsappNumber = settings.whatsappNumber;
    var buttonColor = (settings.buttonColor || '#25D366').trim();
    var buttonPosition = settings.buttonPosition || 'bottom-right';

    // Clean phone number: remove all spaces, dashes, parentheses, and the '+' symbol
    var cleanNumber = whatsappNumber.replace(/[\s\-\(\)\+]/g, '');

    // Create anchor link element
    var button = document.createElement('a');
    button.href = 'https://wa.me/' + cleanNumber;
    button.target = '_blank';
    button.rel = 'noopener noreferrer';
    button.className = 'shopify-whatsapp-chat-button';

    // Apply styles to the button
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    if (buttonPosition === 'bottom-left') {
      button.style.left = '20px';
    } else {
      button.style.right = '20px';
    }
    button.style.width = '56px';
    button.style.height = '56px';
    button.style.borderRadius = '50%';
    button.style.backgroundColor = buttonColor;
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
    button.style.zIndex = '9999';
    button.style.transition = 'transform 0.2s ease-in-out';
    button.style.cursor = 'pointer';

    // Hover effect: scale up to 1.1
    button.addEventListener('mouseover', function () {
      button.style.transform = 'scale(1.1)';
    });
    button.addEventListener('mouseout', function () {
      button.style.transform = 'scale(1.0)';
    });

    // Create SVG container
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '32');
    svg.setAttribute('height', '32');
    svg.style.fill = '#ffffff';

    // Create SVG path for the WhatsApp icon
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z');
    svg.appendChild(path);
    button.appendChild(svg);

    // Inject the button into the body
    document.body.appendChild(button);
  }

  // Wait for the DOM to be fully loaded before running init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
