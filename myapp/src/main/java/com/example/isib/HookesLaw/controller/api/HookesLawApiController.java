package com.example.isib.HookesLaw.controller.api;

import java.util.HashMap;
import java.util.Map;
import org.springframework.web.bind.annotation.*;
import com.example.isib.HookesLaw.model.HookesLawSimulation;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/HookesLaw/api")
@RequiredArgsConstructor
public class HookesLawApiController {
    
    private final HookesLawSimulation currentSimulation;
    
    @PostMapping("/update-params")
    public Map<String, Object> updateParameters(@RequestBody Map<String, Double> params) {
        Map<String, Object> response = new HashMap<>();
        
        if (params.containsKey("stiffness")) {
            currentSimulation.setStiffness(params.get("stiffness"));
        }
        if (params.containsKey("mass")) {
            currentSimulation.setMass(params.get("mass"));
        }
        if (params.containsKey("damping")) {
            currentSimulation.setDamping(params.get("damping"));
        }
        if (params.containsKey("displacement")) {
            currentSimulation.setDisplacement(params.get("displacement"));
        }
        
        currentSimulation.updatePhysics();
        
        response.put("success", true);
        response.put("force", currentSimulation.getForce());
        response.put("acceleration", currentSimulation.getAcceleration());
        response.put("position", currentSimulation.getCurrentPosition());
        
        return response;
    }
    
    @GetMapping("/state")
    public Map<String, Object> getState() {
        Map<String, Object> response = new HashMap<>();
        currentSimulation.updatePhysics();
        
        response.put("stiffness", currentSimulation.getStiffness());
        response.put("mass", currentSimulation.getMass());
        response.put("damping", currentSimulation.getDamping());
        response.put("displacement", currentSimulation.getDisplacement());
        response.put("force", currentSimulation.getForce());
        response.put("acceleration", currentSimulation.getAcceleration());
        response.put("position", currentSimulation.getCurrentPosition());
        response.put("equilibriumX", HookesLawSimulation.getEquilibriumX());
        response.put("minX", HookesLawSimulation.getMinPosition());
        response.put("maxX", HookesLawSimulation.getMaxPosition());
        
        return response;
    }
    
    @PostMapping("/reset")
    public Map<String, Object> reset() {
        currentSimulation.setDisplacement(0.0);
        currentSimulation.setVelocity(0.0);
        currentSimulation.setAcceleration(0.0);
        currentSimulation.updatePhysics();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("position", currentSimulation.getCurrentPosition());
        
        return response;
    }
}