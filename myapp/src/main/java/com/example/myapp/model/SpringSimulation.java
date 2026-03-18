package com.example.hookeslaw.model;

public class SpringSimulation {
    private double stiffness;      // жёсткость пружины (k)
    private double mass;           // масса груза (m)
    private double damping;         // демпфирование
    private double displacement;    // смещение от равновесия (Δx)
    private double force;           // сила упругости (F)
    private double velocity;        // скорость
    private double acceleration;    // ускорение
    
    // Константы для расчета
    private static final double EQUILIBRIUM_X = 400.0; // положение равновесия в px
    private static final double MIN_POSITION = 240.0;
    private static final double MAX_POSITION = 560.0;
    
    public SpringSimulation() {
        this.stiffness = 1.5;
        this.mass = 1.0;
        this.damping = 0.14;
        this.displacement = 0.0;
        this.force = 0.0;
        this.velocity = 0.0;
        this.acceleration = 0.0;
    }
    
    public SpringSimulation(double stiffness, double mass, double damping) {
        this.stiffness = stiffness;
        this.mass = mass;
        this.damping = damping;
        this.displacement = 0.0;
        this.force = 0.0;
        this.velocity = 0.0;
        this.acceleration = 0.0;
    }
    
    // Расчет силы по закону Гука: F = -k * Δx
    public double calculateForce() {
        this.force = -this.stiffness * this.displacement;
        return this.force;
    }
    
    // Расчет ускорения: a = F/m
    public double calculateAcceleration() {
        if (this.mass != 0) {
            this.acceleration = this.force / this.mass;
        }
        return this.acceleration;
    }
    
    // Обновление физики на основе текущих параметров
    public void updatePhysics() {
        calculateForce();
        calculateAcceleration();
    }
    
    // Расчет потенциальной энергии: E = (k * Δx²)/2
    public double calculatePotentialEnergy() {
        return 0.5 * this.stiffness * Math.pow(this.displacement, 2);
    }
    
    // Расчет текущей позиции груза на canvas
    public double getCurrentPosition() {
        return EQUILIBRIUM_X + this.displacement;
    }
    
    // Проверка, находится ли позиция в допустимых пределах
    public boolean isValidPosition(double position) {
        return position >= MIN_POSITION && position <= MAX_POSITION;
    }
    
    // Геттеры и сеттеры
    public double getStiffness() {
        return stiffness;
    }
    
    public void setStiffness(double stiffness) {
        this.stiffness = stiffness;
    }
    
    public double getMass() {
        return mass;
    }
    
    public void setMass(double mass) {
        this.mass = mass;
    }
    
    public double getDamping() {
        return damping;
    }
    
    public void setDamping(double damping) {
        this.damping = damping;
    }
    
    public double getDisplacement() {
        return displacement;
    }
    
    public void setDisplacement(double displacement) {
        this.displacement = displacement;
    }
    
    public double getForce() {
        return force;
    }
    
    public void setForce(double force) {
        this.force = force;
    }
    
    public double getVelocity() {
        return velocity;
    }
    
    public void setVelocity(double velocity) {
        this.velocity = velocity;
    }
    
    public double getAcceleration() {
        return acceleration;
    }
    
    public void setAcceleration(double acceleration) {
        this.acceleration = acceleration;
    }
    
    public static double getEquilibriumX() {
        return EQUILIBRIUM_X;
    }
    
    public static double getMinPosition() {
        return MIN_POSITION;
    }
    
    public static double getMaxPosition() {
        return MAX_POSITION;
    }
    
    @Override
    public String toString() {
        return String.format("SpringSimulation{k=%.2f, m=%.2f, damp=%.2f, dx=%.2f, F=%.2f}", 
                stiffness, mass, damping, displacement, force);
    }
}