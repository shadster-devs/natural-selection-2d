class QLearning {
    alpha: number;
    gamma: number;
    epsilon: number;
    qTable: Record<string, Record<string, number>>;

    constructor(alpha: number, gamma: number, epsilon: number) {
        this.alpha = alpha; // Learning rate
        this.gamma = gamma; // Discount factor
        this.epsilon = epsilon; // Exploration rate
        this.qTable = {};
    }

    getStateKey(state: any) {
        return JSON.stringify(state);
    }

    getQValue(state: any, action: string) {
        const stateKey = this.getStateKey(state);
        if (!this.qTable[stateKey]) {
            this.qTable[stateKey] = {};
        }
        if (!this.qTable[stateKey][action]) {
            this.qTable[stateKey][action] = 0;
        }
        return this.qTable[stateKey][action];
    }

    updateQValue(state: any, action: string, reward: number, nextState: any) {
        const stateKey = this.getStateKey(state);
        const nextStateKey = this.getStateKey(nextState);
        if (!this.qTable[stateKey]) {
            this.qTable[stateKey] = {};
        }
        if (!this.qTable[stateKey][action]) {
            this.qTable[stateKey][action] = 0;
        }
        const maxNextQValue = Math.max(...Object.values(this.qTable[nextStateKey] || { default: 0 }));
        this.qTable[stateKey][action] += this.alpha * (reward + this.gamma * maxNextQValue - this.qTable[stateKey][action]);
    }
}

export default QLearning;
