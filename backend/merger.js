export default {
    /**
     * Simple object check.
     * @param item
     * @returns {boolean}
     */
    IsObject(item) {
        return (item && typeof item === 'object' && !Array.isArray(item));
    },

    /**
     * Deep merge two objects.
     * @param target
     * @param ...sources
     */
    DeepMerge(target, ...sources) {
        if (!sources.length) return target;

        const source = sources.shift();

        if (this.IsObject(target) && this.IsObject(source)) {
            for (const key in source) {
                if (this.IsObject(source[key])) {
                    if (!target[key]) Object.assign(target, {
                        [key]: {}
                    });

                    this.DeepMerge(target[key], source[key]);
                } else {
                    Object.assign(target, {
                        [key]: source[key]
                    });
                }
            }
        }

        return this.DeepMerge(target, ...sources);
    }
};