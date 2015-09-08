/**
 * ClassExclusionStrategyHelper.java
 * com.codyy.commons.utils.gson
 * Function：  
 *
 * @author   xiongping
 * Copyright (c) 2015, Codyy All Rights Reserved.
*/

package com.codyy.commons.utils.gson;

import java.util.HashMap;
import java.util.Map;

import com.codyy.commons.utils.StringUtils;
import com.google.gson.ExclusionStrategy;
import com.google.gson.FieldAttributes;

/**
 * ClassName:ClassExclusionStrategyHelper Function: TODO
 *
 * @author xiongping
 * @Date 2015 2015年8月26日 下午5:22:11
 *
 */

public class ClassExclusionStrategyHelper implements ExclusionStrategy {
	private Map<String, String> classMap = new HashMap<String, String>();
	private boolean excludeClass;

	public ClassExclusionStrategyHelper(Class<?>[] clazzes, boolean excludeClass) {
		this.excludeClass = excludeClass;
		for (Class<?> clazz : clazzes) {
			classMap.put(clazz.getName(), clazz.getName());
		}
	}

	@Override
	public boolean shouldSkipField(FieldAttributes f) {
		return false;
	}

	@Override
	public boolean shouldSkipClass(Class<?> clazz) {
		if (hasKey(clazz.getName())) {
			return excludeClass;
		} else {
			return !excludeClass;
		}
	}

	private boolean hasKey(String fileName) {
		return StringUtils.isBlank(this.classMap.get(fileName));
	}
}
