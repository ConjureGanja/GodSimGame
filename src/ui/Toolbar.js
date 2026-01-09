// Toolbar - Tool selection sidebar

export class Toolbar {
    constructor() {
        this.currentTool = 'forest';
        this.setupButtons();
    }

    setupButtons() {
        // Buttons are already in HTML, just need to track state
        this.setTool('forest'); // Set initial tool
    }

    setTool(toolName) {
        this.currentTool = toolName;
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        const button = document.querySelector(`button[onclick="setTool('${toolName}')"]`);
        if(button) {
            button.classList.add('active');
        }
    }

    getCurrentTool() {
        return this.currentTool;
    }
}

// Global function for onclick handlers in HTML
window.setTool = function(toolName) {
    if(window.gameToolbar) {
        window.gameToolbar.setTool(toolName);
    }
};
