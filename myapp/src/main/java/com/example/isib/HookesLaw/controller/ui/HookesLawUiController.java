package com.example.isib.HookesLaw.controller.ui;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import com.example.isib.HookesLaw.model.HookesLawSimulation;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class HookesLawUiController {
    
    private final HookesLawSimulation currentSimulation;
    
    @GetMapping("/HookesLaw")
    public String index(Model model) {
        model.addAttribute("simulation", currentSimulation);
        model.addAttribute("initialK", currentSimulation.getStiffness());
        model.addAttribute("initialMass", currentSimulation.getMass());
        model.addAttribute("initialDamp", currentSimulation.getDamping());
        return "/HookesLaw/HookesLawIndex";
    }
}