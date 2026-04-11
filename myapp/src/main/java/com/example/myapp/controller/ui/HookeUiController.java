package com.example.myapp.controller.ui;  // Измените package

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import com.example.myapp.model.SpringSimulation;  // Измените импорт
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class HookeUiController {
    
    private final SpringSimulation currentSimulation;
    
    @GetMapping("/")
    public String index(Model model) {
        model.addAttribute("simulation", currentSimulation);
        model.addAttribute("initialK", currentSimulation.getStiffness());
        model.addAttribute("initialMass", currentSimulation.getMass());
        model.addAttribute("initialDamp", currentSimulation.getDamping());
        return "index";
    }
}