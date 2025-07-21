/**
 * Evolutionary Algorithm Implementation
 * 
 * This file contains the core logic for the evolutionary algorithm simulation,
 * including individual representation, population management, genetic operators,
 * selection methods, and fitness functions.
 */

// Constants
const DIMENSIONS = 2; // We'll use 2D individuals for easier visualization

/**
 * Individual Class
 * Represents a single solution in the population
 */
class Individual {
    constructor(genes = null) {
        // Initialize genes randomly if not provided
        this.genes = genes || Array.from({ length: DIMENSIONS }, () => Math.random() * 10 - 5);
        this.fitness = 0; // Will be calculated later
    }

    /**
     * Create a deep copy of this individual
     */
    clone() {
        return new Individual([...this.genes]);
    }

    /**
     * Calculate Euclidean distance to another individual
     */
    distanceTo(other) {
        return Math.sqrt(
            this.genes.reduce((sum, gene, i) => {
                const diff = gene - other.genes[i];
                return sum + diff * diff;
            }, 0)
        );
    }
}

/**
 * Population Class
 * Manages a collection of individuals
 */
class Population {
    constructor(size) {
        this.individuals = Array.from({ length: size }, () => new Individual());
        this.size = size;
        this.generation = 0;
        this.bestIndividual = null;
        this.averageFitness = 0;
        this.diversity = 0;
    }

    /**
     * Evaluate fitness for all individuals in the population
     */
    evaluateFitness(fitnessFunction) {
        // Calculate fitness for each individual
        this.individuals.forEach(individual => {
            individual.fitness = fitnessFunction(individual.genes);
        });

        // Sort individuals by fitness (assuming higher is better)
        this.individuals.sort((a, b) => b.fitness - a.fitness);

        // Update population statistics
        this.bestIndividual = this.individuals[0];
        this.averageFitness = this.individuals.reduce((sum, ind) => sum + ind.fitness, 0) / this.size;
        this.calculateDiversity();
    }

    /**
     * Calculate population diversity (average distance between individuals)
     */
    calculateDiversity() {
        let totalDistance = 0;
        let comparisons = 0;

        // Sample a subset of individuals for efficiency if population is large
        const sampleSize = Math.min(this.size, 30);
        const sample = this.individuals.slice(0, sampleSize);

        for (let i = 0; i < sample.length; i++) {
            for (let j = i + 1; j < sample.length; j++) {
                totalDistance += sample[i].distanceTo(sample[j]);
                comparisons++;
            }
        }

        this.diversity = comparisons > 0 ? totalDistance / comparisons : 0;
    }

    /**
     * Create a new generation through selection, crossover, and mutation
     */
    evolve(selectionMethod, crossoverRate, mutationRate, selectionPressure) {
        this.generation++;

        // Select parents and create offspring
        const offspring = [];

        while (offspring.length < this.size) {
            // Select parents
            const parents = selectionMethod(this.individuals, selectionPressure);
            
            // Perform crossover with some probability
            let child1, child2;
            
            if (Math.random() < crossoverRate) {
                [child1, child2] = crossover(parents[0], parents[1]);
            } else {
                child1 = parents[0].clone();
                child2 = parents[1].clone();
            }
            
            // Perform mutation
            mutate(child1, mutationRate);
            mutate(child2, mutationRate);
            
            // Add to offspring
            offspring.push(child1);
            if (offspring.length < this.size) {
                offspring.push(child2);
            }
        }

        // Replace population with offspring
        this.individuals = offspring;
    }
}

/**
 * Fitness Functions
 * Different objective functions to optimize
 */
const FitnessFunctions = {
    // Sphere function (simple unimodal function)
    sphere: (genes) => {
        const sum = genes.reduce((acc, x) => acc + x * x, 0);
        return 100 / (1 + sum); // Transformed to maximize (higher is better)
    },
    
    // Rastrigin function (multimodal with regular local optima)
    rastrigin: (genes) => {
        const A = 10;
        const sum = genes.reduce((acc, x) => {
            return acc + (x * x - A * Math.cos(2 * Math.PI * x));
        }, 0);
        const result = A * genes.length + sum;
        return 100 / (1 + result); // Transformed to maximize
    },
    
    // Rosenbrock function (valley-shaped)
    rosenbrock: (genes) => {
        let sum = 0;
        for (let i = 0; i < genes.length - 1; i++) {
            const term1 = 100 * Math.pow(genes[i + 1] - Math.pow(genes[i], 2), 2);
            const term2 = Math.pow(1 - genes[i], 2);
            sum += term1 + term2;
        }
        return 100 / (1 + sum); // Transformed to maximize
    },
    
    // Ackley function (many local optima)
    ackley: (genes) => {
        const a = 20;
        const b = 0.2;
        const c = 2 * Math.PI;
        
        const n = genes.length;
        let sum1 = 0;
        let sum2 = 0;
        
        for (let i = 0; i < n; i++) {
            sum1 += genes[i] * genes[i];
            sum2 += Math.cos(c * genes[i]);
        }
        
        const term1 = -a * Math.exp(-b * Math.sqrt(sum1 / n));
        const term2 = -Math.exp(sum2 / n);
        const result = term1 + term2 + a + Math.E;
        
        return 100 / (1 + result); // Transformed to maximize
    }
};

/**
 * Selection Methods
 * Different ways to select individuals for reproduction
 */

// Tournament selection
function tournamentSelection(population, tournamentSize) {
    const selected = [];
    
    // Select two parents
    for (let i = 0; i < 2; i++) {
        // Randomly select individuals for the tournament
        const tournament = [];
        for (let j = 0; j < tournamentSize; j++) {
            const randomIndex = Math.floor(Math.random() * population.length);
            tournament.push(population[randomIndex]);
        }
        
        // Find the best individual in the tournament
        let best = tournament[0];
        for (let j = 1; j < tournament.length; j++) {
            if (tournament[j].fitness > best.fitness) {
                best = tournament[j];
            }
        }
        
        selected.push(best);
    }
    
    return selected;
}

// Roulette wheel selection
function rouletteWheelSelection(population) {
    const selected = [];
    
    // Calculate total fitness
    const totalFitness = population.reduce((sum, individual) => sum + individual.fitness, 0);
    
    // Select two parents
    for (let i = 0; i < 2; i++) {
        // Spin the wheel
        let randomValue = Math.random() * totalFitness;
        let cumulativeFitness = 0;
        
        for (const individual of population) {
            cumulativeFitness += individual.fitness;
            if (cumulativeFitness >= randomValue) {
                selected.push(individual);
                break;
            }
        }
        
        // Fallback in case of numerical issues
        if (selected.length <= i) {
            selected.push(population[Math.floor(Math.random() * population.length)]);
        }
    }
    
    return selected;
}

// Rank selection
function rankSelection(population) {
    const selected = [];
    const n = population.length;
    
    // Calculate rank-based probabilities
    const ranks = Array.from({ length: n }, (_, i) => n - i);
    const totalRank = ranks.reduce((sum, rank) => sum + rank, 0);
    
    // Select two parents
    for (let i = 0; i < 2; i++) {
        // Spin the wheel
        let randomValue = Math.random() * totalRank;
        let cumulativeRank = 0;
        
        for (let j = 0; j < n; j++) {
            cumulativeRank += ranks[j];
            if (cumulativeRank >= randomValue) {
                selected.push(population[j]);
                break;
            }
        }
        
        // Fallback
        if (selected.length <= i) {
            selected.push(population[Math.floor(Math.random() * n)]);
        }
    }
    
    return selected;
}

/**
 * Selection method factory
 */
const SelectionMethods = {
    tournament: (population, pressure) => tournamentSelection(population, pressure),
    roulette: (population) => rouletteWheelSelection(population),
    rank: (population) => rankSelection(population)
};

/**
 * Genetic Operators
 */

// Crossover operator (single-point crossover)
function crossover(parent1, parent2) {
    const child1 = parent1.clone();
    const child2 = parent2.clone();
    
    // Choose a random crossover point
    const crossoverPoint = Math.floor(Math.random() * DIMENSIONS);
    
    // Swap genes after the crossover point
    for (let i = crossoverPoint; i < DIMENSIONS; i++) {
        [child1.genes[i], child2.genes[i]] = [child2.genes[i], child1.genes[i]];
    }
    
    return [child1, child2];
}

// Mutation operator (Gaussian mutation)
function mutate(individual, mutationRate) {
    for (let i = 0; i < individual.genes.length; i++) {
        if (Math.random() < mutationRate) {
            // Add Gaussian noise
            const gaussianNoise = randomGaussian() * 0.5; // Standard deviation of 0.5
            individual.genes[i] += gaussianNoise;
            
            // Clamp to valid range
            individual.genes[i] = Math.max(-5, Math.min(5, individual.genes[i]));
        }
    }
}

// Helper function for Gaussian random numbers (Box-Muller transform)
function randomGaussian() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/**
 * Evolutionary Algorithm Class
 * Manages the entire evolutionary process
 */
class EvolutionaryAlgorithm {
    constructor(params = {}) {
        // Set default parameters
        this.populationSize = params.populationSize || 50;
        this.mutationRate = params.mutationRate || 0.1;
        this.crossoverRate = params.crossoverRate || 0.7;
        this.selectionPressure = params.selectionPressure || 3;
        this.fitnessFunction = params.fitnessFunction || 'sphere';
        this.selectionMethod = params.selectionMethod || 'tournament';
        
        // Initialize population
        this.population = new Population(this.populationSize);
        this.isRunning = false;
        this.history = {
            bestFitness: [],
            avgFitness: [],
            diversity: []
        };
    }
    
    /**
     * Initialize or reset the algorithm
     */
    initialize(params = {}) {
        // Update parameters if provided
        if (params.populationSize) this.populationSize = params.populationSize;
        if (params.mutationRate !== undefined) this.mutationRate = params.mutationRate;
        if (params.crossoverRate !== undefined) this.crossoverRate = params.crossoverRate;
        if (params.selectionPressure) this.selectionPressure = params.selectionPressure;
        if (params.fitnessFunction) this.fitnessFunction = params.fitnessFunction;
        if (params.selectionMethod) this.selectionMethod = params.selectionMethod;
        
        // Create new population
        this.population = new Population(this.populationSize);
        
        // Evaluate initial fitness
        this.population.evaluateFitness(FitnessFunctions[this.fitnessFunction]);
        
        // Reset history
        this.history = {
            bestFitness: [this.population.bestIndividual.fitness],
            avgFitness: [this.population.averageFitness],
            diversity: [this.population.diversity]
        };
        
        this.isRunning = false;
        
        // Return current state for visualization
        return this.getCurrentState();
    }
    
    /**
     * Perform one generation of evolution
     */
    step() {
        console.log("Starting evolution step, current generation:", this.population.generation);
        
        // Evolve the population
        this.population.evolve(
            (pop, pressure) => SelectionMethods[this.selectionMethod](pop, pressure),
            this.crossoverRate,
            this.mutationRate,
            this.selectionPressure
        );
        
        console.log("Population evolved, new generation:", this.population.generation);
        
        // Evaluate fitness
        this.population.evaluateFitness(FitnessFunctions[this.fitnessFunction]);
        
        // Update history
        this.history.bestFitness.push(this.population.bestIndividual.fitness);
        this.history.avgFitness.push(this.population.averageFitness);
        this.history.diversity.push(this.population.diversity);
        
        console.log("Step completed, generation:", this.population.generation,
                   "best fitness:", this.population.bestIndividual.fitness);
        
        // Return current state for visualization
        return this.getCurrentState();
    }
    
    /**
     * Start continuous evolution
     */
    start(callback, interval = 100) {
        if (!this.isRunning) {
            this.isRunning = true;
            this.evolutionInterval = setInterval(() => {
                const state = this.step();
                if (callback) callback(state);
            }, interval);
        }
    }
    
    /**
     * Pause evolution
     */
    pause() {
        if (this.isRunning) {
            clearInterval(this.evolutionInterval);
            this.isRunning = false;
        }
    }
    
    /**
     * Get current state of the algorithm for visualization
     */
    getCurrentState() {
        return {
            generation: this.population.generation,
            bestIndividual: this.population.bestIndividual,
            bestFitness: this.population.bestIndividual.fitness,
            averageFitness: this.population.averageFitness,
            diversity: this.population.diversity,
            population: this.population.individuals,
            history: this.history
        };
    }
    
    /**
     * Get fitness landscape data for visualization
     */
    getFitnessLandscapeData(resolution = 50) {
        const data = [];
        const fitnessFunc = FitnessFunctions[this.fitnessFunction];
        
        // Generate grid of points
        for (let x = -5; x <= 5; x += 10 / resolution) {
            for (let y = -5; y <= 5; y += 10 / resolution) {
                const fitness = fitnessFunc([x, y]);
                data.push({ x, y, z: fitness });
            }
        }
        
        return data;
    }
}

// Export the main classes and functions
window.EvolutionaryAlgorithm = EvolutionaryAlgorithm;
window.Individual = Individual;
window.Population = Population;
window.FitnessFunctions = FitnessFunctions;
window.SelectionMethods = SelectionMethods;