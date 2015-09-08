package com.codyy.commons.utils;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.math.NumberUtils;
import org.apache.log4j.Logger;
import com.codyy.commons.image.ImageConfig;
import com.codyy.commons.image.ImageUtil;

/**
 * 文档转换工具类
 *
 */
public class DocTransferUtil {
	
	private static Logger logger = Logger.getLogger(DocTransferUtil.class);

	private static final String trans_servers_properties = "trans-servers.properties";

	private static Map<String, String> transInfo = getTransInfo();

	public static Map<String, String> getTransInfo() {
		Map<String, String> map = null;
		Properties properties = new Properties();
		try {
			properties.load(DocTransferUtil.class.getClassLoader().getResourceAsStream(trans_servers_properties));
		} catch (IOException e) {
			logger.error("read" + trans_servers_properties + ",but occur error");
			e.printStackTrace();
			return null;
		}
		if (properties.size() == 0) {
			logger.error(trans_servers_properties + " contains 0 server configuration");
			return null;
		}
		for (Map.Entry<Object, Object> entry : properties.entrySet()) {
			String key = entry.getKey().toString();
			if (key.equalsIgnoreCase("local.ip")) {
				;
			} else if (key.equalsIgnoreCase("local.port")) {
				;
			} else if (key.equalsIgnoreCase("video.trans.thread")) {
				;
			} else if (key.equalsIgnoreCase("trans.timeout")) {
				;
			} else {
				map = new HashMap<String, String>();
				map.put("ip", entry.getKey().toString());
				map.put("port", entry.getValue().toString());
			}
		}
		return map;
	}

	/**
	 * 文档转换
	 * 
	 * @param fileName
	 * @param companyId
	 * @param whetherDynamicppt
	 * @throws NoSuchAlgorithmException
	 */
	@SuppressWarnings({ "rawtypes", "unchecked" })
	public static void transDocument(String fileName, String whetherDynamicppt, ImageConfig config) throws NoSuchAlgorithmException {
		whetherDynamicppt = "N";//TODO 临时关闭，以后需要动态ppt转换再删除该行打开
		if (StringUtils.isEmpty(whetherDynamicppt)) {
			logger.debug("param command error");
			return;
		}
		logger.debug("start document transfer");

		String folder = config.getMeettransFolder();
		String fullFilename = ImageUtil.buildFile(folder, fileName);
		String transFilename = ImageUtil.buildFile(folder, fileName);
		// 如果没有后缀,标记为转换失败
		if (fileName.indexOf('.') == -1) {
			logger.error("filename error:" + fullFilename);
			return;
		}

		/*// 如果文件不存在,标记为失败
		File file = new File(fullFilename);
		if (!file.exists() || file.isDirectory()) {
			logger.error("resource file not exist:" + fullFilename);
			return;
		}*/

		// 向转换服务器发送转换服务
		try {
			logger.debug("send trans file:" + transFilename);
			String id = fileName.substring(0, fileName.lastIndexOf("."));

			Map map = new HashMap<String, Object>();
			map.put("id", id);
			map.put("priority", 9);
			map.put("file", transFilename);
			map.put("targetFolder", ImageUtil.buildFileParentPath(folder, fileName) + File.separatorChar + id);
			map.put("prefix", "");
			map.put("type", "SWF");
			if ("Y".equals(whetherDynamicppt)) {// 动态PPT
				map.put("command", "dynamic_ppt_trans_task");
			} else if ("N".equals(whetherDynamicppt)) {// 非动态PPT的文档
				map.put("command", "doc_trans_task");
			} else {
				logger.info("page error send trans command : " + whetherDynamicppt);
			}

			byte[] sendbyte = TransClientProtocol.getProtocol(map);
			if (transInfo == null) {
				transInfo = getTransInfo();
			}

			Socket socket = new Socket(transInfo.get("ip"), Integer.parseInt(transInfo.get("port")));
			OutputStream output = socket.getOutputStream();
			output.write(sendbyte);
			output.flush();

			InputStream input = socket.getInputStream();
			StringBuffer strb = new StringBuffer();
			int intChar;
			System.out.println("read:");
			while (true) {
				intChar = input.read();
				if (intChar == 0)
					break;
				if (intChar == -1) {

				} else {
					strb.append((char) intChar);
				}
			}
			logger.info("receive command:" + strb.toString());
			output.close();
			input.close();
			socket.close();
		} catch (IOException e) {
			e.printStackTrace();
		}
		logger.debug("end document transfer");
	}

	/**
	 * 判断转换是否完成
	 * 
	 * @param courseDocumentId
	 * @throws NoSuchAlgorithmException
	 */
	public static List<String> checkTransDocument(String fileName, ImageConfig config) throws NoSuchAlgorithmException {
		List<String> list = new ArrayList<String>();
		logger.debug("Check trans document result start");
		String folder = config.getMeetFolder();
		String fullFilename = ImageUtil.buildFile(folder, fileName);
		// 检查文件是否已经转换成功,成后修改转换状态和页数
		String prex = fullFilename.substring(0, fullFilename.lastIndexOf('.'));
		String pageFilename = prex + File.separatorChar + "totalpage.txt";
		logger.debug("pageFilename=" + pageFilename);
		File pageFile = new File(pageFilename);
		if (pageFile.exists() && pageFile.isFile()) {
			logger.debug("pageFilename exist:" + pageFilename);
			try {
				FileReader reader = new FileReader(pageFile);
				char[] buffer = new char[512];
				int len = reader.read(buffer);
				if (len > 0) {
					String s = new String(buffer, 0, len);
					if (NumberUtils.isNumber(s)) {
						Integer pageCount = Integer.valueOf(s);
						list.add(pageCount.toString());
					}
				}
				reader.close();
				FileUtils.deleteDirectory(prex + "/" + fileName.substring(0, fileName.lastIndexOf('.')));
			} catch (FileNotFoundException e) {
				e.printStackTrace();
			} catch (IOException e) {
				e.printStackTrace();
			}
		} else {
			File file = new File(prex);
			File[] files = file.listFiles(new FileSuffixFilter("swf"));
			if (files != null) {
				list.add(String.valueOf(files.length));
				list.add("");
			} else {
				list.add("0");
				list.add("");
			}
		}
		logger.debug("End check trans document result");
		return list;
	}
}
