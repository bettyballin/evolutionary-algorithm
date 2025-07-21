/**
 * Evolutionary Algorithm Visualizer - Main Application
 * 
 * This file contains the main application logic that initializes the evolutionary algorithm,
 * sets up the visualizations, and handles user interactions.
 */

// Main application class
class EvolutionaryAlgorithmApp {
    constructor() {
        // Initialize the evolutionary algorithm
        this.algorithm = new EvolutionaryAlgorithm();
        
        // Initialize visualizations
        this.initVisualizations();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize UI with current values
        this.updateUIValues();
        
        // Initialize the algorithm
        this.resetAlgorithm();
    }
    
    initVisualizations() {
        // Create visualization instances
        this.fitnessLandscapeViz = new FitnessLandscapeViz('fitness-landscape-viz');
        this.populationDiversityViz = new PopulationDiversityViz('population-diversity-viz');
        this.geneticOperationsViz = new GeneticOperationsViz('mutation-viz', 'crossover-viz');
        this.generationProgressionViz = new GenerationProgressionViz('generation-progression');
        
        // Initial update of visualizations
        this.updateVisualizations();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.resizeVisualizations();
        });
    }
    
    setupEventListeners() {
        // Parameter sliders
        document.getElementById('populationSize').addEventListener('input', (e) => {
            document.getElementById('populationSizeValue').textContent = e.target.value;
        });
        
        document.getElementById('mutationRate').addEventListener('input', (e) => {
            document.getElementById('mutationRateValue').textContent = e.target.value;
        });
        
        document.getElementById('crossoverRate').addEventListener('input', (e) => {
            document.getElementById('crossoverRateValue').textContent = e.target.value;
        });
        
        document.getElementById('selectionPressure').addEventListener('input', (e) => {
            document.getElementById('selectionPressureValue').textContent = e.target.value;
        });
        
        // Buttons
        document.getElementById('startButton').addEventListener('click', () => {
            this.startEvolution();
        });
        
        document.getElementById('pauseButton').addEventListener('click', () => {
            this.pauseEvolution();
        });
        
        document.getElementById('resetButton').addEventListener('click', () => {
            this.resetAlgorithm();
        });
        
        document.getElementById('stepButton').addEventListener('click', () => {
            this.stepEvolution();
        });
        
        // Tab buttons - Use a different approach with direct DOM manipulation
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const tabId = button.getAttribute('data-tab');
                console.log("Tab clicked:", tabId);
                
                // Remove active class from all buttons
                document.querySelectorAll('.tab-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Remove active class from all panes
                document.querySelectorAll('.tab-pane').forEach(pane => {
                    pane.classList.remove('active');
                    pane.style.display = 'none';
                });
                
                // Add active class to clicked button
                button.classList.add('active');
                
                // Get the tab pane and activate it
                const tabPane = document.getElementById(tabId);
                if (tabPane) {
                    console.log("Activating tab pane:", tabId);
                    tabPane.classList.add('active');
                    tabPane.style.display = 'block';
                    
                    // Force update visualizations after tab change
                    setTimeout(() => {
                        this.updateVisualizations();
                        console.log("Visualizations updated after tab change");
                    }, 100);
                } else {
                    console.error("Tab pane not found:", tabId);
                }
                
                // Prevent default behavior
                e.preventDefault();
            });
        });
    }
    
    updateUIValues() {
        // Update UI with current algorithm parameters
        document.getElementById('populationSize').value = this.algorithm.populationSize;
        document.getElementById('populationSizeValue').textContent = this.algorithm.populationSize;
        
        document.getElementById('mutationRate').value = this.algorithm.mutationRate;
        document.getElementById('mutationRateValue').textContent = this.algorithm.mutationRate;
        
        document.getElementById('crossoverRate').value = this.algorithm.crossoverRate;
        document.getElementById('crossoverRateValue').textContent = this.algorithm.crossoverRate;
        
        document.getElementById('selectionPressure').value = this.algorithm.selectionPressure;
        document.getElementById('selectionPressureValue').textContent = this.algorithm.selectionPressure;
        
        document.getElementById('fitnessFunction').value = this.algorithm.fitnessFunction;
        document.getElementById('selectionMethod').value = this.algorithm.selectionMethod;
    }
    
    getParametersFromUI() {
        return {
            populationSize: parseInt(document.getElementById('populationSize').value),
            mutationRate: parseFloat(document.getElementById('mutationRate').value),
            crossoverRate: parseFloat(document.getElementById('crossoverRate').value),
            selectionPressure: parseFloat(document.getElementById('selectionPressure').value),
            fitnessFunction: document.getElementById('fitnessFunction').value,
            selectionMethod: document.getElementById('selectionMethod').value
        };
    }
    
    resetAlgorithm() {
        // Pause if running
        this.pauseEvolution();
        
        // Get parameters from UI
        const params = this.getParametersFromUI();
        
        // Initialize algorithm with parameters
        this.algorithm.initialize(params);
        
        // Update visualizations
        this.updateVisualizations();
        
        // Update stats display
        this.updateStats();
        
        // Enable/disable buttons
        document.getElementById('startButton').disabled = false;
        document.getElementById('pauseButton').disabled = true;
        document.getElementById('stepButton').disabled = false;
        
        console.log("Algorithm reset with parameters:", params);
    }
    
    startEvolution() {
        console.log("Starting evolution...");
        
        try {
            // Start continuous evolution
            this.algorithm.start((state) => {
                // Update visualizations and stats
                this.updateVisualizations();
                this.updateStats();
                
                // Log the current state for debugging
                console.log("Evolution step, generation:", this.algorithm.population.generation,
                           "best fitness:", this.algorithm.population.bestIndividual.fitness.toFixed(4));
            }, 500); // Update every 500ms for better performance
            
            // Enable/disable buttons
            document.getElementById('startButton').disabled = true;
            document.getElementById('pauseButton').disabled = false;
            document.getElementById('stepButton').disabled = true;
            
            console.log("Evolution started successfully");
        } catch (error) {
            console.error("Error starting evolution:", error);
        }
    }
    
    pauseEvolution() {
        console.log("Pausing evolution...");
        
        try {
            // Pause evolution
            if (this.algorithm.isRunning) {
                this.algorithm.pause();
            }
            
            // Enable/disable buttons
            document.getElementById('startButton').disabled = false;
            document.getElementById('pauseButton').disabled = true;
            document.getElementById('stepButton').disabled = false;
        } catch (error) {
            console.error("Error pausing evolution:", error);
        }
    }
    
    stepEvolution() {
        console.log("Stepping one generation...");
        
        try {
            // Perform one generation
            const state = this.algorithm.step();
            console.log("Generation completed:", this.algorithm.population.generation);
            
            // Update visualizations and stats
            this.updateVisualizations();
            this.updateStats();
            
            // Log the current state for debugging
            console.log("Current state:", {
                generation: this.algorithm.population.generation,
                bestFitness: this.algorithm.population.bestIndividual.fitness,
                avgFitness: this.algorithm.population.averageFitness,
                diversity: this.algorithm.population.diversity
            });
        } catch (error) {
            console.error("Error stepping evolution:", error);
        }
    }
    
    updateVisualizations() {
        try {
            console.log("Updating visualizations...");
            
            // Update all visualizations with current algorithm state
            this.fitnessLandscapeViz.update(this.algorithm);
            this.populationDiversityViz.update(this.algorithm);
            this.geneticOperationsViz.update(this.algorithm);
            this.generationProgressionViz.update(this.algorithm);
            
            console.log("Visualizations updated successfully");
        } catch (error) {
            console.error("Error updating visualizations:", error);
        }
    }
    
    resizeVisualizations() {
        try {
            console.log("Resizing visualizations...");
            
            // Resize all visualizations
            this.fitnessLandscapeViz.resize();
            this.populationDiversityViz.resize();
            this.geneticOperationsViz.resize();
            this.generationProgressionViz.resize();
            
            // Update visualizations with current algorithm state
            this.updateVisualizations();
            
            console.log("Visualizations resized successfully");
        } catch (error) {
            console.error("Error resizing visualizations:", error);
        }
    }
    
    updateStats() {
        try {
            // Update statistics display
            const generation = this.algorithm.population.generation;
            const bestFitness = this.algorithm.population.bestIndividual.fitness.toFixed(4);
            const avgFitness = this.algorithm.population.averageFitness.toFixed(4);
            const diversity = this.algorithm.population.diversity.toFixed(4);
            
            document.getElementById('generation-count').textContent = generation;
            document.getElementById('best-fitness').textContent = bestFitness;
            document.getElementById('avg-fitness').textContent = avgFitness;
            document.getElementById('diversity').textContent = diversity;
            
            console.log(`Stats updated - Generation: ${generation}, Best: ${bestFitness}, Avg: ${avgFitness}, Diversity: ${diversity}`);
        } catch (error) {
            console.error("Error updating stats:", error);
        }
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new EvolutionaryAlgorithmApp();
});