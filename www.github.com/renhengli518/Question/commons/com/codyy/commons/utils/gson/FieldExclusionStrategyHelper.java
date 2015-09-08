/**
 * FieldExclusionStrategyHelper.java
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
 * ClassName:FieldExclusionStrategyHelper Function: TODO
 *
 * @author xiongping
 * @Date 2015 2015年8月26日 下午5:16:52
 * 
 */

public class FieldExclusionStrategyHelper implements ExclusionStrategy {
	private Map<String, String> fieldMap = new HashMap<String, String>();
	private boolean excludeField;
	private Class<?> clazz;

	/**
	 * 
	 * fieldNames 为空则全部过滤或者全部不过滤
	 * 
	 * Creates a new instance of FieldExclusionStrategyHelper.
	 *
	 * @author xiongping
	 * @param fieldNames
	 * @param exclude
	 * @param clazz
	 * 
	 */
	public FieldExclusionStrategyHelper(String[] fieldNames, boolean exclude, Class<?> clazz) {
		if (fieldNames != null) {
			for (String string : fieldNames) {
				this.fieldMap.put(string, string);
			}
		}
		this.excludeField = exclude;
		this.clazz = clazz;
	}

	@Override
	public boolean shouldSkipField(FieldAttributes f) {
		Class<?> fieldClass = f.getDeclaringClass();
		if(!clazz.isAssignableFrom(fieldClass) && !fieldClass.isAssignableFrom(clazz)){
			return false;
		}
		if (hasKey(f.getName())) {
			return excludeField;
		} else {
			return !excludeField;
		}
	}

	@Override
	public boolean shouldSkipClass(Class<?> clazz) {
		return false;
	}

	private boolean hasKey(String fileName) {
		return StringUtils.isBlank(this.fieldMap.get(fileName));
	}
}
