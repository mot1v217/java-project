package com.example.myapp.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {
    
    @GetMapping("/")
    public String home(Model model) {
        // Добавляем данные, которые можно использовать в шаблоне
        model.addAttribute("title", "Закон Гука");
        model.addAttribute("description", "Имитация колебаний пружины");
        return "index"; // имя шаблона (index.html)
    }
}