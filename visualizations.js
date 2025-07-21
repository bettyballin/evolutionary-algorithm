/**
 * Evolutionary Algorithm Visualizations
 * 
 * This file contains D3.js-based visualizations for the evolutionary algorithm.
 */

// Fitness Landscape Visualization
class FitnessLandscapeViz {
    constructor(containerId) {
        this.container = d3.select(`#${containerId}`);
        this.width = this.container.node().getBoundingClientRect().width;
        this.height = this.container.node().getBoundingClientRect().height;
        this.margin = { top: 20, right: 20, bottom: 30, left: 40 };
        this.init();
    }
    
    init() {
        // Clear previous content
        this.container.html("");
        
        // Create SVG
        this.svg = this.container.append("svg")
            .attr("width", this.width)
            .attr("height", this.height);
            
        // Create scales
        this.xScale = d3.scaleLinear()
            .domain([-5, 5])
            .range([this.margin.left, this.width - this.margin.right]);
            
        this.yScale = d3.scaleLinear()
            .domain([-5, 5])
            .range([this.height - this.margin.bottom, this.margin.top]);
            
        this.colorScale = d3.scaleSequential(d3.interpolateViridis)
            .domain([0, 100]);
            
        // Add axes
        this.svg.append("g")
            .attr("transform", `translate(0,${this.height - this.margin.bottom})`)
            .call(d3.axisBottom(this.xScale));
            
        this.svg.append("g")
            .attr("transform", `translate(${this.margin.left},0)`)
            .call(d3.axisLeft(this.yScale));
            
        // Add title
        this.svg.append("text")
            .attr("x", this.width / 2)
            .attr("y", this.margin.top / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .text("Fitness Landscape");
            
        // Create groups for visualization
        this.contourGroup = this.svg.append("g");
        this.populationGroup = this.svg.append("g");
    }
    
    update(algorithm) {
        // Get fitness landscape data
        const landscapeData = algorithm.getFitnessLandscapeData(30);
        
        // Convert to the format needed for contour plot
        const values = landscapeData.map(d => d.z);
        const n = Math.sqrt(landscapeData.length);
        
        // Create contour generator
        const contours = d3.contours()
            .size([n, n])
            .thresholds(d3.range(0, 100, 10))
            .smooth(true)
            (values);
            
        // Clear previous contours
        this.contourGroup.selectAll("path").remove();
        
        // Draw contour lines
        this.contourGroup.selectAll("path")
            .data(contours)
            .enter()
            .append("path")
            .attr("d", d3.geoPath(d3.geoIdentity()
                .scale(this.width / n)
                .translate([0, 0])))
            .attr("fill", d => this.colorScale(d.value))
            .attr("stroke", "rgba(0,0,0,0.2)")
            .attr("stroke-width", 0.5);
            
        // Update population visualization
        this.updatePopulation(algorithm.population.individuals);
    }
    
    updatePopulation(individuals) {
        // Update population points
        const points = this.populationGroup.selectAll("circle")
            .data(individuals);
            
        // Remove old points
        points.exit().remove();
        
        // Add new points
        points.enter()
            .append("circle")
            .attr("r", 4)
            .merge(points)
            .attr("cx", d => this.xScale(d.genes[0]))
            .attr("cy", d => this.yScale(d.genes[1]))
            .attr("fill", "red")
            .attr("stroke", "white")
            .attr("stroke-width", 1)
            .attr("opacity", 0.7);
    }
    
    resize() {
        this.width = this.container.node().getBoundingClientRect().width;
        this.height = this.container.node().getBoundingClientRect().height;
        
        this.svg.attr("width", this.width).attr("height", this.height);
        
        this.xScale.range([this.margin.left, this.width - this.margin.right]);
        this.yScale.range([this.height - this.margin.bottom, this.margin.top]);
    }
}

// Population Diversity Visualization
class PopulationDiversityViz {
    constructor(containerId) {
        this.container = d3.select(`#${containerId}`);
        this.width = this.container.node().getBoundingClientRect().width;
        this.height = this.container.node().getBoundingClientRect().height;
        this.margin = { top: 20, right: 20, bottom: 30, left: 40 };
        this.init();
    }
    
    init() {
        // Clear previous content
        this.container.html("");
        
        // Create SVG
        this.svg = this.container.append("svg")
            .attr("width", this.width)
            .attr("height", this.height);
            
        // Create scales
        this.xScale = d3.scaleLinear()
            .range([this.margin.left, this.width - this.margin.right]);
            
        this.yScale = d3.scaleLinear()
            .domain([0, 10])
            .range([this.height - this.margin.bottom, this.margin.top]);
            
        // Add axes
        this.xAxis = this.svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${this.height - this.margin.bottom})`);
            
        this.yAxis = this.svg.append("g")
            .attr("class", "y-axis")
            .attr("transform", `translate(${this.margin.left},0)`)
            .call(d3.axisLeft(this.yScale));
            
        // Add title
        this.svg.append("text")
            .attr("x", this.width / 2)
            .attr("y", this.margin.top / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .text("Population Diversity");
            
        // Add axis labels
        this.svg.append("text")
            .attr("x", this.width / 2)
            .attr("y", this.height - 5)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text("Generation");
            
        this.svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -this.height / 2)
            .attr("y", 15)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text("Diversity");
            
        // Create a group for the line
        this.lineGroup = this.svg.append("g");
        
        // Create line generator
        this.line = d3.line()
            .x(d => this.xScale(d.generation))
            .y(d => this.yScale(d.diversity))
            .curve(d3.curveMonotoneX);
    }
    
    update(algorithm) {
        // Get diversity history
        const diversityData = algorithm.history.diversity.map((d, i) => ({
            generation: i,
            diversity: d
        }));
        
        // Update x scale domain
        this.xScale.domain([0, Math.max(10, algorithm.population.generation)]);
        
        // Update y scale domain based on data
        const maxDiversity = Math.max(5, d3.max(diversityData, d => d.diversity));
        this.yScale.domain([0, maxDiversity]);
        
        // Update axes
        this.xAxis.call(d3.axisBottom(this.xScale).ticks(5));
        this.yAxis.call(d3.axisLeft(this.yScale));
        
        // Update line
        this.lineGroup.selectAll("path").remove();
        this.lineGroup.append("path")
            .datum(diversityData)
            .attr("fill", "none")
            .attr("stroke", "#3498db")
            .attr("stroke-width", 2)
            .attr("d", this.line);
            
        // Add points
        const points = this.lineGroup.selectAll("circle")
            .data(diversityData);
            
        points.exit().remove();
        
        points.enter()
            .append("circle")
            .attr("r", 3)
            .merge(points)
            .attr("cx", d => this.xScale(d.generation))
            .attr("cy", d => this.yScale(d.diversity))
            .attr("fill", "#3498db");
    }
    
    resize() {
        this.width = this.container.node().getBoundingClientRect().width;
        this.height = this.container.node().getBoundingClientRect().height;
        
        this.svg.attr("width", this.width).attr("height", this.height);
        
        this.xScale.range([this.margin.left, this.width - this.margin.right]);
        this.yScale.range([this.height - this.margin.bottom, this.margin.top]);
        
        this.xAxis.attr("transform", `translate(0,${this.height - this.margin.bottom})`)
            .call(d3.axisBottom(this.xScale));
        this.yAxis.call(d3.axisLeft(this.yScale));
    }
}

// Genetic Operations Visualization
class GeneticOperationsViz {
    constructor(mutationContainerId, crossoverContainerId) {
        this.mutationContainer = d3.select(`#${mutationContainerId}`);
        this.crossoverContainer = d3.select(`#${crossoverContainerId}`);
        
        this.width = this.mutationContainer.node().getBoundingClientRect().width;
        this.height = this.mutationContainer.node().getBoundingClientRect().height;
        this.margin = { top: 20, right: 20, bottom: 30, left: 40 };
        
        this.initMutation();
        this.initCrossover();
    }
    
    initMutation() {
        // Clear previous content
        this.mutationContainer.html("");
        
        // Create SVG
        this.mutationSvg = this.mutationContainer.append("svg")
            .attr("width", this.width)
            .attr("height", this.height);
            
        // Add title
        this.mutationSvg.append("text")
            .attr("x", this.width / 2)
            .attr("y", this.margin.top / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .text("Mutation Operation");
            
        // Create scales
        this.mutationXScale = d3.scaleLinear()
            .domain([-5, 5])
            .range([this.margin.left, this.width - this.margin.right]);
            
        this.mutationYScale = d3.scaleLinear()
            .domain([-5, 5])
            .range([this.height - this.margin.bottom, this.margin.top]);
            
        // Add axes
        this.mutationSvg.append("g")
            .attr("transform", `translate(0,${this.height - this.margin.bottom})`)
            .call(d3.axisBottom(this.mutationXScale));
            
        this.mutationSvg.append("g")
            .attr("transform", `translate(${this.margin.left},0)`)
            .call(d3.axisLeft(this.mutationYScale));
            
        // Create groups for visualization elements
        this.beforeMutationGroup = this.mutationSvg.append("g");
        this.afterMutationGroup = this.mutationSvg.append("g");
    }
    
    initCrossover() {
        // Clear previous content
        this.crossoverContainer.html("");
        
        // Create SVG
        this.crossoverSvg = this.crossoverContainer.append("svg")
            .attr("width", this.width)
            .attr("height", this.height);
            
        // Add title
        this.crossoverSvg.append("text")
            .attr("x", this.width / 2)
            .attr("y", this.margin.top / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .style("font-weight", "bold")
            .text("Crossover Operation");
            
        // Create scales
        this.crossoverXScale = d3.scaleLinear()
            .domain([-5, 5])
            .range([this.margin.left, this.width - this.margin.right]);
            
        this.crossoverYScale = d3.scaleLinear()
            .domain([-5, 5])
            .range([this.height - this.margin.bottom, this.margin.top]);
            
        // Add axes
        this.crossoverSvg.append("g")
            .attr("transform", `translate(0,${this.height - this.margin.bottom})`)
            .call(d3.axisBottom(this.crossoverXScale));
            
        this.crossoverSvg.append("g")
            .attr("transform", `translate(${this.margin.left},0)`)
            .call(d3.axisLeft(this.crossoverYScale));
            
        // Create groups for visualization elements
        this.parentsGroup = this.crossoverSvg.append("g");
        this.childrenGroup = this.crossoverSvg.append("g");
    }
    
    update(algorithm) {
        // Simplified update for demonstration
        this.updateMutation(algorithm);
        this.updateCrossover(algorithm);
    }
    
    updateMutation(algorithm) {
        // Clear previous elements
        this.beforeMutationGroup.selectAll("*").remove();
        this.afterMutationGroup.selectAll("*").remove();
        
        // Get a random individual
        const individuals = algorithm.population.individuals;
        if (individuals.length > 0) {
            const index = Math.floor(Math.random() * individuals.length);
            const individual = individuals[index].clone();
            
            // Create a mutated copy
            const mutated = individual.clone();
            mutate(mutated, algorithm.mutationRate * 2);
            
            // Draw original individual
            this.beforeMutationGroup.append("circle")
                .attr("cx", this.mutationXScale(individual.genes[0]))
                .attr("cy", this.mutationYScale(individual.genes[1]))
                .attr("r", 6)
                .attr("fill", "#3498db");
                
            // Draw mutated individual
            this.afterMutationGroup.append("circle")
                .attr("cx", this.mutationXScale(mutated.genes[0]))
                .attr("cy", this.mutationYScale(mutated.genes[1]))
                .attr("r", 6)
                .attr("fill", "#e74c3c");
        }
    }
    
    updateCrossover(algorithm) {
        // Clear previous elements
        this.parentsGroup.selectAll("*").remove();
        this.childrenGroup.selectAll("*").remove();
        
        // Get two random individuals
        const individuals = algorithm.population.individuals;
        if (individuals.length >= 2) {
            const index1 = Math.floor(Math.random() * individuals.length);
            let index2;
            do {
                index2 = Math.floor(Math.random() * individuals.length);
            } while (index1 === index2);
            
            const parent1 = individuals[index1].clone();
            const parent2 = individuals[index2].clone();
            
            // Create children
            const [child1, child2] = crossover(parent1, parent2);
            
            // Draw parents
            this.parentsGroup.append("circle")
                .attr("cx", this.crossoverXScale(parent1.genes[0]))
                .attr("cy", this.crossoverYScale(parent1.genes[1]))
                .attr("r", 6)
                .attr("fill", "#3498db");
                
            this.parentsGroup.append("circle")
                .attr("cx", this.crossoverXScale(parent2.genes[0]))
                .attr("cy", this.crossoverYScale(parent2.genes[1]))
                .attr("r", 6)
                .attr("fill", "#9b59b6");
                
            // Draw children
            this.childrenGroup.append("circle")
                .attr("cx", this.crossoverXScale(child1.genes[0]))
                .attr("cy", this.crossoverYScale(child1.genes[1]))
                .attr("r", 6)
                .attr("fill", "#e74c3c");
                
            this.childrenGroup.append("circle")
                .attr("cx", this.crossoverXScale(child2.genes[0]))
                .attr("cy", this.crossoverYScale(child2.genes[1]))
                .attr("r", 6)
                .attr("fill", "#f39c12");
        }
    }
    
    resize() {
        this.width = this.mutationContainer.node().getBoundingClientRect().width;
        this.height = this.mutationContainer.node().getBoundingClientRect().height;
        
        this.mutationSvg.attr("width", this.width).attr("height", this.height);
        this.crossoverSvg.attr("width", this.width).attr("height", this.height);
        
        this.mutationXScale.range([this.margin.left, this.width - this.margin.right]);
        this.mutationYScale.range([this.height - this.margin.bottom, this.margin.top]);
        
        this.crossoverXScale.range([this.margin.left, this.width - this.margin.right]);
        this.crossoverYScale.range([this.height - this.margin.bottom, this.margin.top]);
    }
}

// Generation Progression Visualization
class GenerationProgressionViz {
    constructor(containerId) {
        this.container = d3.select(`#${containerId}`);
        this.width = this.container.node().getBoundingClientRect().width;
        this.height = this.container.node().getBoundingClientRect().height;
        this.margin = { top: 10, right: 20, bottom: 30, left: 50 };
        this.init();
    }
    
    init() {
        // Clear previous content
        this.container.html("");
        
        // Create SVG
        this.svg = this.container.append("svg")
            .attr("width", this.width)
            .attr("height", this.height);
            
        // Create scales
        this.xScale = d3.scaleLinear()
            .domain([0, 20])
            .range([this.margin.left, this.width - this.margin.right]);
            
        this.yScale = d3.scaleLinear()
            .domain([0, 100])
            .range([this.height - this.margin.bottom, this.margin.top]);
            
        // Add axes
        this.xAxis = this.svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${this.height - this.margin.bottom})`)
            .call(d3.axisBottom(this.xScale).ticks(5));
            
        this.yAxis = this.svg.append("g")
            .attr("class", "y-axis")
            .attr("transform", `translate(${this.margin.left},0)`)
            .call(d3.axisLeft(this.yScale).ticks(5));
            
        // Create groups for lines
        this.bestFitnessGroup = this.svg.append("g");
        this.avgFitnessGroup = this.svg.append("g");
        
        // Create line generators
        this.bestFitnessLine = d3.line()
            .x(d => this.xScale(d.generation))
            .y(d => this.yScale(d.fitness))
            .curve(d3.curveMonotoneX);
            
        this.avgFitnessLine = d3.line()
            .x(d => this.xScale(d.generation))
            .y(d => this.yScale(d.fitness))
            .curve(d3.curveMonotoneX);
    }
    
    update(algorithm) {
        // Get fitness history
        const bestFitnessData = algorithm.history.bestFitness.map((fitness, i) => ({
            generation: i,
            fitness: fitness
        }));
        
        const avgFitnessData = algorithm.history.avgFitness.map((fitness, i) => ({
            generation: i,
            fitness: fitness
        }));
        
        // Update x scale domain
        const maxGen = Math.max(20, algorithm.population.generation);
        this.xScale.domain([0, maxGen]);
        
        // Update y scale domain
        const maxFitness = Math.max(
            d3.max(bestFitnessData, d => d.fitness),
            d3.max(avgFitnessData, d => d.fitness)
        );
        this.yScale.domain([0, Math.max(100, maxFitness * 1.1)]);
        
        // Update axes
        this.xAxis.call(d3.axisBottom(this.xScale).ticks(5));
        this.yAxis.call(d3.axisLeft(this.yScale).ticks(5));
        
        // Update best fitness line
        this.bestFitnessGroup.selectAll("*").remove();
        this.bestFitnessGroup.append("path")
            .datum(bestFitnessData)
            .attr("fill", "none")
            .attr("stroke", "#e74c3c")
            .attr("stroke-width", 2)
            .attr("d", this.bestFitnessLine);
            
        // Update average fitness line
        this.avgFitnessGroup.selectAll("*").remove();
        this.avgFitnessGroup.append("path")
            .datum(avgFitnessData)
            .attr("fill", "none")
            .attr("stroke", "#3498db")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,5")
            .attr("d", this.avgFitnessLine);
    }
    
    resize() {
        this.width = this.container.node().getBoundingClientRect().width;
        this.height = this.container.node().getBoundingClientRect().height;
        
        this.svg.attr("width", this.width).attr("height", this.height);
        
        this.xScale.range([this.margin.left, this.width - this.margin.right]);
        this.yScale.range([this.height - this.margin.bottom, this.margin.top]);
        
        this.xAxis.attr("transform", `translate(0,${this.height - this.margin.bottom})`)
            .call(d3.axisBottom(this.xScale));
        this.yAxis.call(d3.axisLeft(this.yScale));
    }
}

// Export visualization classes
window.FitnessLandscapeViz = FitnessLandscapeViz;
window.PopulationDiversityViz = PopulationDiversityViz;
window.GeneticOperationsViz = GeneticOperationsViz;
window.GenerationProgressionViz = GenerationProgressionViz;