class QLearning {
    alpha: number;
    gamma: number;
    epsilon: number;
    minEpsilon: number;
    decayRate: number;
    experienceBuffer: Array<{ state: any, action: string, reward: number, nextState: any }>;
    maxBufferSize: number;
    qTable: Record<string, Record<string, number>>;

    constructor(alpha: number, gamma: number, epsilon: number, minEpsilon: number, decayRate: number) {
        this.alpha = alpha; // Learning rate
        this.gamma = gamma; // Discount factor
        this.epsilon = epsilon; // Exploration rate
        this.minEpsilon = minEpsilon; // Minimum epsilon value for decay
        this.decayRate = decayRate; // Rate at which epsilon decays
        this.qTable = {};
        this.experienceBuffer = [];
        this.maxBufferSize = 1000; // Maximum size of experience buffer
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

    // Adding experience to the replay buffer
    addExperience(state: any, action: string, reward: number, nextState: any) {
        if (this.experienceBuffer.length >= this.maxBufferSize) {
            this.experienceBuffer.shift(); // Remove oldest experience if buffer is full
        }
        this.experienceBuffer.push({state, action, reward, nextState});
    }

    // Sample and train from experience buffer
    trainFromBuffer(batchSize: number) {
        const samples = this.sampleRandomly(this.experienceBuffer, batchSize);
        samples.forEach(({state, action, reward, nextState}) => {
            this.updateQValue(state, action, reward, nextState);
        });
    }

    // Utility function to randomly sample from buffer
    sampleRandomly(buffer: Array<any>, sampleSize: number) {
        const sample = [];
        for (let i = 0; i < sampleSize && i < buffer.length; i++) {
            sample.push(buffer[Math.floor(Math.random() * buffer.length)]);
        }
        return sample;
    }

    // Epsilon decay to encourage exploration at the beginning and exploitation later
    decayEpsilon() {
        this.epsilon = Math.max(this.minEpsilon, this.epsilon * this.decayRate);
    }
}

export default QLearning;