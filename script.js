// script.js

// Configurações do Firebase (substitua com suas próprias configurações)
const firebaseConfig = {
    apiKey: "AIzaSyBUTRTAWyrFzCCT_vygthHkBCe_zqvg7x0",
    authDomain: "battleofpixels-aab44.firebaseapp.com",
    databaseURL: "https://battleofpixels-aab44-default-rtdb.firebaseio.com",
    projectId: "battleofpixels-aab44",
    storageBucket: "battleofpixels-aab44.appspot.com",
    messagingSenderId: "543163281560",
    appId: "1:543163281560:web:889839e86742c147aee0ed",
    measurementId: "G-M14QQ0NQKT"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

document.addEventListener('DOMContentLoaded', () => {
    const pixelBoard = document.getElementById('pixel-board');
    const colorPickerContainer = document.getElementById('color-picker-container');
    const colorPicker = document.getElementById('color-picker');
    const colorConfirm = document.getElementById('color-confirm');
    let selectedColor = 'black';
    let currentUserNick = localStorage.getItem('userNick');

    // Cria os pixels
    for (let i = 0; i < 10000; i++) { // 100x100 pixels
        const pixel = document.createElement('div');
        pixel.classList.add('pixel');
        pixel.dataset.index = i;
        pixelBoard.appendChild(pixel);
    }

    // Carrega o estado atual do quadro de pixels do Firebase
    database.ref('pixels').once('value', (snapshot) => {
        const pixels = snapshot.val();
        if (pixels) {
            Object.keys(pixels).forEach(index => {
                const pixel = document.querySelector(`.pixel[data-index="${index}"]`);
                pixel.style.backgroundColor = pixels[index].color;
                pixel.dataset.nick = pixels[index].nick; // Adiciona o nick como um atributo de dados
            });
        }
    });

        // Função para abrir o seletor de cores
        function openColorPicker(event) {
            colorPickerContainer.style.display = 'flex';
            colorPickerContainer.style.top = `${event.clientY}px`;
            colorPickerContainer.style.left = `${event.clientX}px`;
        }
    
        // Evento de clique em um pixel
        pixelBoard.addEventListener('click', (event) => {
            if (event.target.classList.contains('pixel')) {
                const index = event.target.dataset.index;
                const currentColor = event.target.style.backgroundColor;
    
                if (currentColor && currentColor !== 'white') {
                    // Abre o seletor de cores próximo ao ponteiro do mouse
                    openColorPicker(event);
                    colorConfirm.onclick = () => {
                        selectedColor = colorPicker.value;
    
                        // Atualiza a cor do pixel no Firebase
                        database.ref('pixels/' + index).set({
                            color: selectedColor,
                            nick: currentUserNick
                        });
    
                        // Atualiza a cor do pixel na UI
                        event.target.style.backgroundColor = selectedColor;
                        colorPickerContainer.style.display = 'none';
                    };
                } else {
                    // Atualiza a cor do pixel no Firebase
                    database.ref('pixels/' + index).set({
                        color: selectedColor,
                        nick: currentUserNick
                    });
    
                    // Atualiza a cor do pixel na UI
                    event.target.style.backgroundColor = selectedColor;
                }
            }
        });

    // Escuta mudanças em tempo real no Firebase
    database.ref('pixels').on('child_changed', (snapshot) => {
        const index = snapshot.key;
        const data = snapshot.val();
        const pixel = document.querySelector(`.pixel[data-index="${index}"]`);
        pixel.style.backgroundColor = data.color;
        pixel.dataset.nick = data.nick; // Adiciona o nick como um atributo de dados
    });

    // Escuta adições em tempo real no Firebase
    database.ref('pixels').on('child_added', (snapshot) => {
        const index = snapshot.key;
        const data = snapshot.val();
        const pixel = document.querySelector(`.pixel[data-index="${index}"]`);
        pixel.style.backgroundColor = data.color;
        pixel.dataset.nick = data.nick; // Adiciona o nick como um atributo de dados
    });

    // Escuta remoções em tempo real no Firebase (caso relevante)
    database.ref('pixels').on('child_removed', (snapshot) => {
        const index = snapshot.key;
        const pixel = document.querySelector(`.pixel[data-index="${index}"]`);
        pixel.style.backgroundColor = ''; // Reseta a cor do pixel
        delete pixel.dataset.nick; // Remove o atributo de dados do nick
    });

    // Modal de Boas-Vindas
    const welcomeModal = document.getElementById('welcome-modal');
    const closeWelcomeModal = document.getElementById('close-welcome-modal');
    const submitNick = document.getElementById('submit-nick');
    const nickInput = document.getElementById('nick-input');
    const userGreeting = document.getElementById('user-greeting'); // Elemento para o nick

    // Função para exibir o texto letra por letra
    function typeText(text, element) {
        element.textContent = ''; // Clear the existing text
        let i = 0;
        const speed = 100; // The speed/duration of the effect in milliseconds
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        type();
    }

    // Verifica se o nick do usuário está salvo no localStorage
    const savedNick = localStorage.getItem('userNick');

    if (savedNick) {
        // Se o nick está salvo, exibe a saudação diretamente
        userGreeting.textContent = `Olá, ${savedNick}`;
    } else {
        // Se o nick não está salvo, exibe o modal de boas-vindas
        window.addEventListener('load', () => {
            welcomeModal.style.display = 'block';
        });

        // Fecha o modal de boas-vindas quando o usuário clica no "x"
        closeWelcomeModal.addEventListener('click', () => {
            welcomeModal.style.display = 'none';
        });

        // Fecha o modal de boas-vindas se o usuário clicar fora do modal
        window.addEventListener('click', (event) => {
            if (event.target === welcomeModal) {
                welcomeModal.style.display = 'none';
            }
        });

        // Salva o nick no Firebase e no localStorage quando o botão é clicado
        submitNick.addEventListener('click', () => {
            const nick = nickInput.value.trim();
            if (nick) {
                // Salva o nick no Firebase
                database.ref('betaTesters').push({ nick: nick }).then(() => {
                    // Salva o nick no localStorage
                    localStorage.setItem('userNick', nick);
                    // Atualiza o elemento de saudação
                    typeText(`Olá, ${nick}`, userGreeting);
                    // Fecha o modal de boas-vindas
                    welcomeModal.style.display = 'none';
                }).catch(error => {
                    console.error('Erro ao salvar o nick:', error);
                });
            } else {
                alert('Por favor, insira um nick válido.');
            }
        });
    }

    // Modal de Informações
    const modal = document.getElementById('modal');
    const closeModal = document.getElementById('close-modal');
    const customLogo = document.querySelector('.logo-effect'); // Seleciona a logo personalizada

    // Abre o modal quando a logo personalizada é clicada
    customLogo.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    // Fecha o modal quando o usuário clica no "x"
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Fecha o modal se o usuário clicar fora do modal
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Adiciona evento de mouseover e mouseout para exibir a assinatura do jogador
    pixelBoard.addEventListener('mouseover', (event) => {
        if (event.target.classList.contains('pixel')) {
            const nick = event.target.dataset.nick;
            if (nick) {
                const tooltip = document.createElement('div');
                tooltip.classList.add('tooltip');
                tooltip.textContent = nick;
                document.body.appendChild(tooltip);

                const rect = event.target.getBoundingClientRect();
                tooltip.style.left = `${rect.left + window.pageXOffset}px`;
                tooltip.style.top = `${rect.top + window.pageYOffset - tooltip.offsetHeight}px`;

                event.target.tooltip = tooltip;
            }
        }
    });

    pixelBoard.addEventListener('mouseout', (event) => {
        if (event.target.classList.contains('pixel')) {
            if (event.target.tooltip) {
                document.body.removeChild(event.target.tooltip);
                event.target.tooltip = null;
            }
        }
    });
});