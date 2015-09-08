package com.codyy.commons.servlet;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.springframework.util.StreamUtils;

import com.codyy.commons.CommonsConstant;
import com.codyy.commons.context.SpringContext;
import com.codyy.commons.image.ImageConfig;
import com.codyy.commons.image.ImageUtil;

/**
 * 
 * ClassName: ImageServlet Function: 根据文件路径读取图片的内容 date: 2015-3-30 下午2:01:25
 * 
 */
public class ImageServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Logger logger = Logger.getLogger(ImageServlet.class);

	public ImageServlet() {
		super();
	}

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String path = request.getPathInfo();
		String filename = path.substring(path.lastIndexOf('/') + 1);
		logger.debug("filename:" + filename);
		if (filename.contains(CommonsConstant.HEAD_PIC_DEFAULT)||filename.contains(CommonsConstant.THUMB_PIC_DEFAULT)) {
			InputStream input = new FileInputStream(request.getServletContext().getRealPath("/") + "public"
					+ File.separatorChar + "img" + File.separatorChar + "common" + File.separatorChar
					+ filename);
			response.addHeader("Cache-Control", "max-age=864000");
			StreamUtils.copy(input, response.getOutputStream());
			input.close();
		} else {
			ImageConfig config = SpringContext.getBean(ImageConfig.class);
			File file = null;
			if (path.contains("/default/")) {
				// 路径中包含/default/, 表面此路径为图片存储在文件服务器的默认路径, 不通过MD5计算
				String paths[] = path.split("/");
				StringBuilder builder = new StringBuilder();
				builder.append(config.getFolder());
				// 组拼图片路径
				for (int i = 1; i < paths.length; i++) {
					builder.append(File.separatorChar);
					builder.append(paths[i]);
				}
				file = new File(builder.toString());
			} else {
				file = new File(ImageUtil.buildFile(config.getFolder(), filename));
			}
			if (file.exists()) {
				InputStream input = new FileInputStream(file);
				response.addHeader("Cache-Control", "max-age=864000");
				StreamUtils.copy(input, response.getOutputStream());
				input.close();
			}
		}
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException,
			IOException {
		doGet(request, response);
	}

}
