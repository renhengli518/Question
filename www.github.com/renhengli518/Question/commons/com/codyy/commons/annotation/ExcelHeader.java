package com.codyy.commons.annotation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 
 * ClassName:Excel
 * Function: Excel导出文件头部标题通用注解
 *
 * @author   zhangtian
 * @Date	 2015	2015年3月24日		下午1:45:24
 *
 */
// 注解范围   类上注解
@Target({ElementType.TYPE})
// 注解加载时机  运行时加载
@Retention(RetentionPolicy.RUNTIME)
// 是否生成注解文档
@Documented
public @interface ExcelHeader {
	
	String headerName() ;		// === 导出文件头部标题
}
