/**
 * Base class for module components.
 * Contains helpers for Alert and Translate.
 */
class ModuleComponent {
	constructor(module) {
        if(!module) {
            throw "Modules missing";
        } 
        
        if (!module.translation || !module.alert) {
            throw "Modules Alert and Translation are required";
        }

		this.module = module;

        this.translate = this.module.translation.t;
        this.show = this.module.alert.show;

        this.s = this.s.bind(this);
        this.t = this.t.bind(this);
    }

    /**
     * Show alert message
     * @param {String} message 
     * @param {String} type 
     */
    s(message, type) {
        return this.show(message, type);
    }

    /**
     * Get translation
     * @param {String} key 
     * @param {function} formatter 
     * @param {String} ns 
     */
    t(key, formatter, ns) {
        return this.translate(key, formatter, ns);
    }
}

export default ModuleComponent;