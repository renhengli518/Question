package com.codyy.commons.bean;

import java.io.Serializable;


public class BaseHomePageMenu implements Serializable{
	/**
	 * 
	 */
	private static final long serialVersionUID = -3407384859385023755L;
	private String menuName;
	private String url;

	public String getMenuName() {
		return menuName;
	}
	public void setMenuName(String menuName) {
		this.menuName = menuName;
	}
	public String getUrl() {
		return url;
	}
	public void setUrl(String url) {
		this.url = url;
	}

}
