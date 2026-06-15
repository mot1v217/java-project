package com.example.isib.HookesLaw.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Getter;
import org.springframework.stereotype.Component;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Component
public class HookesLawSimulation {
    private double stiffness = 1.5;
    private double mass = 1.0;
    private double damping = 0.14;
    private double displacement = 0.0;
    private double force = 0.0;
    private double velocity = 0.0;
    private double acceleration = 0.0;
    
    private static final double EQUILIBRIUM_X = 400.0;
    private static final double MIN_POSITION = 240.0;
    private static final double MAX_POSITION = 560.0;
    
    public double calculateForce() {
        this.force = -this.stiffness * this.displacement;
        return this.force;
    }
    
    public double calculateAcceleration() {
        if (this.mass != 0) {
            this.acceleration = this.force / this.mass;
        }
        return this.acceleration;
    }
    
    public void updatePhysics() {
        calculateForce();
        calculateAcceleration();
    }
    
    public double calculatePotentialEnergy() {
        return 0.5 * this.stiffness * Math.pow(this.displacement, 2);
    }
    
    public double getCurrentPosition() {
        return EQUILIBRIUM_X + this.displacement;
    }
    
    public boolean isValidPosition(double position) {
        return position >= MIN_POSITION && position <= MAX_POSITION;
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
}