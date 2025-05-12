/**
 * Vanilla BlockUI - v1.0
 * 
 * Licencia: MIT
 */
class VanillaBlockUI {
  constructor() {
    this.defaults = {
      // Mensaje a mostrar (string, elemento DOM o null)
      message: '<h1>Por favor espere...</h1>',
      
      // Base styles
      css: {},
      overlayCSS: {},
      
      // Configuración del bloqueo
      fadeIn: 200,
      fadeOut: 400,
      timeout: 0,
      showOverlay: true,
      focusInput: true,
      
      // Clases CSS
      blockMsgClass: 'vanilla-blockui-message',
      baseZ: 1000,
      
      // Comportamiento
      ignoreIfBlocked: false,
      bindEvents: true,
      constrainTabKey: true,
      
      // Callbacks
      onBlock: null,
      onUnblock: null,
      
      // Temas
      theme: false,
      themeCSS: {
        width: '30%',
        top: '40%',
        left: '35%'
      }
    };
    
    this.blockCount = 0;
    this.init();
  }
  
  init() {
    // Crear elementos base
    this.blockEl = document.createElement('div');
    this.blockEl.className = 'vanilla-blockui';
    this.blockEl.style.display = 'none';
    
    this.overlayEl = document.createElement('div');
    this.overlayEl.className = 'vanilla-blockui-overlay';
    
    this.containerEl = document.createElement('div');
    this.containerEl.className = 'vanilla-blockui-container';
    
    this.blockEl.appendChild(this.overlayEl);
    this.blockEl.appendChild(this.containerEl);
    document.body.appendChild(this.blockEl);
    
    // Inyectar CSS si no existe
    if (!document.getElementById('vanilla-blockui-styles')) {
      const style = document.createElement('style');
      style.id = 'vanilla-blockui-styles';
      style.textContent = `
        .vanilla-blockui * {
          box-sizing: border-box;
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  block(options) {
    const config = {...this.defaults, ...options};
    
    // Ignorar si ya está bloqueado
    if (config.ignoreIfBlocked && this.blockCount > 0) {
      return;
    }
    
    this.blockCount++;
    
    // Configurar overlay
    this.overlayEl.style.display = config.showOverlay ? 'block' : 'none';
    Object.assign(this.overlayEl.style, config.overlayCSS);
    
    // Limpiar mensaje anterior
    while (this.containerEl.firstChild) {
      this.containerEl.removeChild(this.containerEl.firstChild);
    }
    
    // Crear mensaje
    let messageEl;
    if (typeof config.message === 'string') {
      messageEl = document.createElement('div');
      messageEl.className = config.blockMsgClass;
      messageEl.innerHTML = config.message;
    } else if (config.message instanceof HTMLElement) {
      messageEl = config.message;
    } else {
      // Spinner por defecto
      messageEl = document.createElement('div');
      messageEl.className = config.blockMsgClass;
      messageEl.innerHTML = '<div class="vanilla-blockui-spinner"></div>';
    }
    
    // Aplicar estilos al mensaje
    Object.assign(messageEl.style, config.css);
    if (config.theme) {
      Object.assign(messageEl.style, config.themeCSS);
    }
    
    this.containerEl.appendChild(messageEl);
    
    // Mostrar con animación
    this.blockEl.style.display = 'block';
    this.blockEl.style.opacity = '0';
    
    let opacity = 0;
    const fadeIn = () => {
      opacity += 16.7 / config.fadeIn;
      this.blockEl.style.opacity = opacity;
      
      if (opacity < 1) {
        requestAnimationFrame(fadeIn);
      } else {
        // Enfocar input si es necesario
        if (config.focusInput) {
          const input = messageEl.querySelector('input,select,textarea');
          if (input) input.focus();
        }
        
        // Evento onBlock
        if (typeof config.onBlock === 'function') {
          config.onBlock();
        }
      }
    };
    
    fadeIn();
    
    // Timeout automático
    if (config.timeout > 0) {
      setTimeout(() => this.unblock(options), config.timeout);
    }
    
    // Manejar eventos de teclado
    if (config.bindEvents) {
      this.handleKeyboardEvents(true, config.constrainTabKey);
    }
  }
  
  unblock(options = {}) {
    if (this.blockCount <= 0) return;
    
    this.blockCount--;
    
    if (this.blockCount > 0) return;
    
    const config = {...this.defaults, ...options};
    
    // Ocultar con animación
    let opacity = 1;
    const fadeOut = () => {
      opacity -= 16.7 / config.fadeOut;
      this.blockEl.style.opacity = opacity;
      
      if (opacity > 0) {
        requestAnimationFrame(fadeOut);
      } else {
        this.blockEl.style.display = 'none';
        
        // Evento onUnblock
        if (typeof config.onUnblock === 'function') {
          config.onUnblock();
        }
      }
    };
    
    fadeOut();
    
    // Liberar eventos de teclado
    if (config.bindEvents) {
      this.handleKeyboardEvents(false);
    }
  }
  
  handleKeyboardEvents(bind, constrainTabKey = true) {
    if (bind) {
      // Bloquear teclado
      this.keydownHandler = (e) => {
        // Bloquear todas las teclas excepto:
        // - Escape (key 27)
        // - Tab (key 9) si constrainTabKey es false
        if (e.keyCode !== 27 && (!constrainTabKey || e.keyCode !== 9)) {
          e.preventDefault();
          e.stopPropagation();
        }
      };
      
      document.addEventListener('keydown', this.keydownHandler);
    } else {
      // Liberar teclado
      if (this.keydownHandler) {
        document.removeEventListener('keydown', this.keydownHandler);
      }
    }
  }
}

// API global
window.BlockUI = {
  _instance: null,
  
  getInstance() {
    if (!this._instance) {
      this._instance = new VanillaBlockUI();
    }
    return this._instance;
  },
  
  block(options) {
    return this.getInstance().block(options);
  },
  
  unblock(options) {
    return this.getInstance().unblock(options);
  }
};

// Métodos directos
window.blockUI = function(options) {
  return BlockUI.block(options);
};

window.unblockUI = function(options) {
  return BlockUI.unblock(options);
};
