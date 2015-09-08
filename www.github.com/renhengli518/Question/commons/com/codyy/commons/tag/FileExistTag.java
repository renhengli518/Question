package com.codyy.commons.tag;

import java.io.File;
import java.io.IOException;

import javax.servlet.jsp.JspException;
import javax.servlet.jsp.JspTagException;
import javax.servlet.jsp.tagext.BodyContent;
import javax.servlet.jsp.tagext.BodyTagSupport;

public class FileExistTag extends BodyTagSupport {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private String name = "";
	private String code = "";

	public void setName(String name) {
		this.name = name;
	}

	public void setCode(String code) {
		this.code = code.toLowerCase();
	}

	@Override
	public int doEndTag() throws JspException {
		try {
			if (bodyContent != null) {
				bodyContent.writeOut(bodyContent.getEnclosingWriter());
			} else {
			}
		} catch (IOException e) {
			throw new JspTagException("IO ERROR:" + e.getMessage());
		}
		return EVAL_PAGE;
	}

	private boolean fileExist() {
		String path = FileExistTag.class.getResource("/").getPath();
		path = path.substring(0, path.indexOf("classes") - 1);
		path = path + "/pages/meeting/layout/" + code + "/module/" + name;
		File file = new File(path);
		return file.exists();
	}

	@Override
	public int doStartTag() throws JspException {
		if (fileExist()) {
			return EVAL_BODY_INCLUDE;
		} else {
			return SKIP_BODY;
		}
	}

	public void doInitBody() throws JspTagException {

	}

	public void setBodyContent(BodyContent bodyContent) {
		this.bodyContent = bodyContent;
	}

}