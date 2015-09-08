package com.codyy.commons.utils;

import java.util.Map;

import net.sf.json.JSONObject;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;

public class TransClientProtocol {
	
	private static final Logger logger = Logger.getLogger(TransClientProtocol.class);

	/**
	 * 封装转换命令JSON对象
	 * @param map
	 * @return
	 */
	@SuppressWarnings("rawtypes")
	public static JSONObject getProtocolJson(Map map){
		if(map.isEmpty()){
			logger.info("transCommand is empty");
			return null;
		}
		if(StringUtils.isEmpty(map.get("command").toString()) || StringUtils.isEmpty(map.get("id").toString())){
			logger.info("transCommand or resourceId is empty");
			return null;
		}
		
		JSONObject jobject = new JSONObject();
		jobject.put("command", map.get("command").toString());
		jobject.put("id", map.get("id").toString());
		jobject.put("priority", Integer.valueOf(map.get("priority").toString()));
		jobject.put("host", "127.0.0.1");
		jobject.put("port", 8080);
		jobject.put("file", map.get("file").toString());
		jobject.put("targetFolder", map.get("targetFolder").toString());
		
		if("video_trans_task".equalsIgnoreCase(map.get("command").toString())){
			jobject.put("format", Integer.valueOf(map.get("format").toString()));
			logger.debug(jobject.toString());
			return jobject;
		} else if("print_screen_task".equalsIgnoreCase(map.get("command").toString())){
			jobject.put("prefix", map.get("prefix").toString());
			jobject.put("start", Integer.valueOf(map.get("start").toString()));
			jobject.put("interval", Integer.valueOf(map.get("interval").toString()));
			jobject.put("count", Integer.valueOf(map.get("count").toString()));
			logger.debug(jobject.toString());
			return jobject;
		} else if("doc_trans_task".equalsIgnoreCase(map.get("command").toString())){
			jobject.put("prefix", map.get("prefix").toString());
			jobject.put("type", map.get("type").toString());
			logger.debug(jobject.toString());
			return jobject;
		} else if("dynamic_ppt_trans_task".equalsIgnoreCase(map.get("command").toString())){
			jobject.put("prefix", map.get("prefix").toString());
			jobject.put("type", map.get("type").toString());
			logger.debug(jobject.toString());
			return jobject;
		} else {
			logger.info("is not this command: "+ map.get("command").toString());
		}
		return null;
	}
	
	public static byte[] getProtocolBytes(JSONObject jobject){
		if(jobject.isEmpty()){
			return null;
		}
		String sjson = jobject.toString();
		int jsonlen = sjson.getBytes().length;
		byte[] b = new byte[jsonlen+1];
		byte[] bjson = sjson.getBytes();
		System.arraycopy(bjson, 0, b, 0, jsonlen);
		b[jsonlen] = 0;//结束符
		return b;
	}
	
	/**
	 * 获取发送转换的JSON对象数组
	 * @param map
	 * @return
	 */
	@SuppressWarnings("rawtypes")
	public static byte[] getProtocol(Map map){
		JSONObject jobject = getProtocolJson(map);
		return getProtocolBytes(jobject);
	}
}
