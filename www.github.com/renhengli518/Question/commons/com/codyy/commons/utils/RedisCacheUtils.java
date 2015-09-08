package com.codyy.commons.utils;

import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.data.redis.core.BoundHashOperations;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.StringRedisTemplate;

import com.codyy.commons.CommonsConstant;
import com.codyy.commons.context.SpringContext;

public class RedisCacheUtils {
	private static StringRedisTemplate template = SpringContext.getBean(StringRedisTemplate.class);

	/**
	 *
	 * addTeachConfigData:向redis中新增授课平台配置信息
	 *
	 * @author xiazhenxing
	 * @param map授课平台信息
	 */
	public static void addPlatformConfigData(Map<String, String> map) {
		if (MapUtils.isEmpty(map)) {
			return;
		}
		// 获取区域ID及配置名称
		String baseAreaId = map.get("baseAreaId");
		String configName = map.get("configName");
		if (StringUtils.isEmpty(baseAreaId) || StringUtils.isEmpty(configName)) {
			return;
		}
		map.remove("baseAreaId");
		map.remove("configName");
		StringBuilder key = new StringBuilder();
		// 以区域ID作为目录
		key.append(CommonsConstant.PLATFORM_CONFIG_REDIS).append(baseAreaId).append(":").append(configName);
		BoundHashOperations<String, String, String> opera = template.boundHashOps(key.toString());
		opera.putAll(map);
	}

	/**
	 *
	 * addFrontConfigData:向redis中新增前台配置信息
	 *
	 * @author xiazhenxing
	 * @param map
	 */
	public static void addFrontConfigData(Map<String, String> map) {
		if (MapUtils.isEmpty(map)) {
			return;
		}
		String baseAreaId = map.get("baseAreaId");
		String schoolId = map.get("schoolId");
		String configName = map.get("configName");
		if (StringUtils.isEmpty(configName)) {
			return;
		}
		map.remove("baseAreaId");
		map.remove("schoolId");
		map.remove("configName");
		// 判断是区域配置还是学校配置
		if (StringUtils.isNotEmpty(baseAreaId)) {
			StringBuilder key = new StringBuilder();
			key.append(CommonsConstant.FRONT_CONFIG_AREA_REDIS).append(baseAreaId).append(":").append(configName);
			BoundHashOperations<String, String, String> opera = template.boundHashOps(key.toString());
			opera.putAll(map);
		} else if (StringUtils.isNotEmpty(schoolId)) {
			StringBuilder key = new StringBuilder();
			key.append(CommonsConstant.FRONT_CONFIG_SCHOOL_REDIS).append(schoolId).append(":").append(configName);
			BoundHashOperations<String, String, String> opera = template.boundHashOps(key.toString());
			opera.putAll(map);
		}
	}

	/**
	 *
	 * getTeachConfigData:根据区域ID及配置名称获取授课平台配置信息
	 *
	 * @author xiazhenxing
	 * @param baseAreaId区域ID
	 * @param configName配置名称
	 * @return 授课平台配置信息
	 */
	public static Map<String, String> getPlatformConfigData(String baseAreaId, String configName) {
		if (StringUtils.isEmpty(configName)) {
			return null;
		}
		StringBuilder key = new StringBuilder();
		key.append(CommonsConstant.PLATFORM_CONFIG_REDIS).append(baseAreaId).append(":").append(configName);

		Map<String, String> config = getConfigData(key.toString());
		// 如果查询不到，则到查询默认值
		if (MapUtils.isEmpty(config)) {
			key.delete(0, key.length());
			key.append(CommonsConstant.DEFAULT_PLATFORM_CONFIG).append(configName);
			config = getConfigData(key.toString());
		}
		return config;
	}

	/**
	 *
	 * getTeachConfigData:根据区域ID及配置名称集合获取授课平台配置信息
	 *
	 * @author xiazhenxing
	 * @param baseAreaId区域ID
	 * @param configNames配置名称集合
	 * @return 授课平台配置信息集合(key: 配置名称, value: 对应的配置信息)
	 */
	public static Map<String, Map<String, String>> getPlatformConfigData(String baseAreaId, List<String> configNames) {
		if (CollectionUtils.isEmpty(configNames)) {
			return null;
		}

		Map<String, Map<String, String>> configs = new HashMap<String, Map<String, String>>();
		for (String configName : configNames) {
			configs.put(configName, getPlatformConfigData(baseAreaId, configName));
		}
		return configs;
	}

	/**
	 *
	 * getFrontAreaConfigData:根据区域ID及配置名称获取前台配置信息
	 *
	 * @author xiazhenxing
	 * @param baseAreaId区域ID
	 * @param configName配置名称
	 * @return 前台配置信息
	 */
	public static Map<String, String> getFrontAreaConfigData(String baseAreaId, String configName) {
		if (StringUtils.isEmpty(configName)) {
			return null;
		}
		StringBuilder key = new StringBuilder();
		key.append(CommonsConstant.FRONT_CONFIG_AREA_REDIS).append(baseAreaId).append(":").append(configName);

		Map<String, String> config = getConfigData(key.toString());
		// 如果查询不到，则到查询默认值
		if (MapUtils.isEmpty(config)) {
			key.delete(0, key.length());
			key.append(CommonsConstant.DEFAULT_FRONT_CONFIG).append(configName);
			config = getConfigData(key.toString());
		}
		return config;
	}

	/**
	 *
	 * getFrontAreaConfigData:根据区域ID及配置名称集合获取前台配置信息
	 *
	 * @author xiazhenxing
	 * @param baseAreaId区域ID
	 * @param configNames配置名称集合
	 * @return 前台配置信息集合(key: 配置名称, value: 对应的配置信息)
	 */
	public static Map<String, Map<String, String>> getFrontAreaConfigData(String baseAreaId, List<String> configNames) {
		if (CollectionUtils.isEmpty(configNames)) {
			return null;
		}

		Map<String, Map<String, String>> configs = new HashMap<String, Map<String, String>>();
		for (String configName : configNames) {
			configs.put(configName, getFrontAreaConfigData(baseAreaId, configName));
		}
		return configs;
	}

	/**
	 *
	 * getFrontSchoolConfigData:根据学校ID及配置名称获取前台配置信息
	 *
	 * @author xiazhenxing
	 * @param schoolId学校ID
	 * @param configName配置名称
	 * @return 前台配置信息
	 */
	public static Map<String, String> getFrontSchoolConfigData(String schoolId, String configName) {
		if (StringUtils.isEmpty(configName)) {
			return null;
		}
		StringBuilder key = new StringBuilder();
		key.append(CommonsConstant.FRONT_CONFIG_SCHOOL_REDIS).append(schoolId).append(":").append(configName);

		Map<String, String> config = getConfigData(key.toString());
		// 如果查询不到，则到查询默认值
		if (MapUtils.isEmpty(config)) {
			key.delete(0, key.length());
			key.append(CommonsConstant.DEFAULT_FRONT_CONFIG).append(configName);
			config = getConfigData(key.toString());
		}
		return config;
	}

	/**
	 *
	 * getFrontSchoolConfigData:根据学校ID及配置名称集合获取前台配置信息
	 *
	 * @author xiazhenxing
	 * @param schoolId学校ID
	 * @param configNames配置名称集合
	 * @return 前台配置信息集合(key: 配置名称, value: 对应的配置信息)
	 */
	public static Map<String, Map<String, String>> getFrontSchoolConfigData(String schoolId, List<String> configNames) {
		if (CollectionUtils.isEmpty(configNames)) {
			return null;
		}

		Map<String, Map<String, String>> configs = new HashMap<String, Map<String, String>>();
		for (String configName : configNames) {
			configs.put(configName, getFrontSchoolConfigData(schoolId, configName));
		}
		return configs;
	}

	/**
	 *
	 * getConfigData:根据key查询对应的map数据
	 *
	 * @author xiazhenxing
	 * @param key
	 *            redisKey
	 * @return 存储信息
	 */
	private static Map<String, String> getConfigData(String key) {
		if (StringUtils.isEmpty(key)) {
			return null;
		}
		HashOperations<String, String, String> oper = template.opsForHash();
		return oper.entries(key);
	}

	public static void addConfigData(String preKey, Map<String, String> config) {
		String configName = config.get("configName");
		if (StringUtils.isEmpty(configName)) {
			return;
		}
		config.remove("configName");
		StringBuilder key = new StringBuilder();
		key.append(preKey).append(configName);
		BoundHashOperations<String, String, String> opera = template.boundHashOps(key.toString());
		opera.putAll(config);
	}

	/**
	 * 
	 * getFrontAreaConfigData:根据区域ID获取该区域下所有的配置信息
	 * 
	 * @author xiazhenxing
	 * @param baseAreaId区域ID
	 * @return 区域配置信息集合
	 */
	public static Map<String, String> getFrontAreaConfigData(String baseAreaId) {
		StringBuilder keyBuilder = new StringBuilder();
		keyBuilder.append(CommonsConstant.FRONT_CONFIG_AREA_REDIS).append(baseAreaId).append(":*");

		Map<String, String> configs = new HashMap<String, String>();

		Set<String> keys = template.keys(keyBuilder.toString());

		String key = null;
		String textContent = null;
		if (CollectionUtils.isNotEmpty(keys)) {
			Iterator<String> ketItr = keys.iterator();
			while (ketItr.hasNext()) {
				key = ketItr.next();
				textContent = getConfigTextContent(key);
				if (StringUtils.isNotEmpty(textContent)) {
					configs.put(getConfigName(key), textContent);
				}
			}
		} else {
			// 如果查询不到，则到查询默认值
			keyBuilder.delete(0, keyBuilder.length());
			keyBuilder.append(CommonsConstant.DEFAULT_FRONT_CONFIG).append("*");
			keys = template.keys(keyBuilder.toString());
			if (CollectionUtils.isNotEmpty(keys)) {
				Iterator<String> ketItr = keys.iterator();
				while (ketItr.hasNext()) {
					key = ketItr.next();
					textContent = getConfigTextContent(key);
					if (StringUtils.isNotEmpty(textContent)) {
						configs.put(getConfigName(key), textContent);
					}
				}
			}
		}
		return configs;
	}

	/**
	 * 
	 * getFrontSchoolConfigData:根据学校ID获取该区域下所有的配置信息
	 * 
	 * @author xiazhenxing
	 * @param schoolId学校ID
	 * @return 学校配置信息集合
	 */
	public static Map<String, String> getFrontSchoolConfigData(String schoolId) {
		StringBuilder keyBuilder = new StringBuilder();
		keyBuilder.append(CommonsConstant.FRONT_CONFIG_SCHOOL_REDIS).append(schoolId).append(":*");

		Map<String, String> configs = new HashMap<String, String>();

		Set<String> keys = template.keys(keyBuilder.toString());

		String key = null;
		String textContent = null;
		if (CollectionUtils.isNotEmpty(keys)) {
			Iterator<String> ketItr = keys.iterator();
			while (ketItr.hasNext()) {
				key = ketItr.next();
				textContent = getConfigTextContent(key);
				if (StringUtils.isNotEmpty(textContent)) {
					configs.put(getConfigName(key), textContent);
				}
			}
		} else {
			// 如果查询不到，则到查询默认值
			keyBuilder.delete(0, keyBuilder.length());
			keyBuilder.append(CommonsConstant.DEFAULT_FRONT_CONFIG).append("*");
			keys = template.keys(keyBuilder.toString());
			if (CollectionUtils.isNotEmpty(keys)) {
				Iterator<String> ketItr = keys.iterator();
				while (ketItr.hasNext()) {
					key = ketItr.next();
					textContent = getConfigTextContent(key);
					if (StringUtils.isNotEmpty(textContent)) {
						configs.put(getConfigName(key), textContent);
					}
				}
			}
		}
		return configs;
	}

	/**
	 * 
	 * getConfigName:根据redis中存储的key获取配置名称(截取最后一个':'后的字符串)
	 * 
	 * @author xiazhenxing
	 * @param key
	 *            redisKey
	 * @return 配置名称
	 */
	private static String getConfigName(String key) {
		// 如果key为null或‘""’则返回key
		if (StringUtils.isEmpty(key)) {
			return key;
		}
		int index = key.lastIndexOf(":");
		return key.substring(index + 1, key.length());
	}

	/**
	 * 
	 * getConfigTextContent:只是获取配置的textContent
	 * 
	 * @author xiazhenxing
	 * @param key
	 * @return
	 */
	private static String getConfigTextContent(String key) {
		if (StringUtils.isEmpty(key)) {
			return null;
		}
		HashOperations<String, String, String> oper = template.opsForHash();
		return oper.get(key, "textContent");
	}
}
