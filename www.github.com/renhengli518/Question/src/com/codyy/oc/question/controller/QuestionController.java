package com.codyy.oc.question.controller;

import javax.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class QuestionController {
	
	@RequestMapping("shareList")
	public String index(HttpServletRequest request){
		return "front/question/shareList";
	}

}
