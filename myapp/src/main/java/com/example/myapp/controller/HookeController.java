package com.example.hookeslaw.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import com.example.hookeslaw.model.SpringSimulation;

@Controller
public class HookeController {
    
    // Для хранения состояния между запросами (в реальном приложении лучше использовать сессию)
    private SpringSimulation currentSimulation = new SpringSimulation();
    
    @GetMapping("/")
    public String index(Model model) {
        model.addAttribute("title", "Закон Гука: имитация пружины");
        model.addAttribute("description", "🔄 имитация колебаний пружины · тяните груз мышкой");
        model.addAttribute("simulation", currentSimulation);
        
        // Добавляем начальные значения для слайдеров
        model.addAttribute("initialK", currentSimulation.getStiffness());
        model.addAttribute("initialMass", currentSimulation.getMass());
        model.addAttribute("initialDamp", currentSimulation.getDamping());
        
        return "index";
    }
    
    // API endpoint для обновления параметров с фронтенда
    @PostMapping("/api/update-params")
    @ResponseBody
    public Map<String, Object> updateParameters(@RequestBody Map<String, Double> params) {
        Map<String, Object> response = new HashMap<>();
        
        try {
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
            
            // Обновляем физику
            currentSimulation.updatePhysics();
            
            response.put("success", true);
            response.put("simulation", currentSimulation);
            response.put("force", currentSimulation.getForce());
            response.put("acceleration", currentSimulation.getAcceleration());
            response.put("position", currentSimulation.getCurrentPosition());
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        
        return response;
    }
    
    // API для получения текущего состояния
    @GetMapping("/api/state")
    @ResponseBody
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
        response.put("equilibriumX", SpringSimulation.getEquilibriumX());
        response.put("minX", SpringSimulation.getMinPosition());
        response.put("maxX", SpringSimulation.getMaxPosition());
        
        return response;
    }
    
    // API для сброса в равновесие
    @PostMapping("/api/reset")
    @ResponseBody
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
    
    // HTML endpoints для форм (если понадобятся)
    @PostMapping("/update")
    public String updateForm(@ModelAttribute SpringSimulation simulation, Model model) {
        currentSimulation = simulation;
        currentSimulation.updatePhysics();
        
        model.addAttribute("title", "Закон Гука: имитация пружины");
        model.addAttribute("description", "🔄 параметры обновлены");
        model.addAttribute("simulation", currentSimulation);
        
        return "index";
    }
}