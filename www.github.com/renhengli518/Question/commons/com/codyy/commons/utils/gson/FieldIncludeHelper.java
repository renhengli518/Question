/**
 * FieldIncludeHelper.java
 * com.codyy.commons.utils.gson
 * Function：  
 *
 * @author   xiongping
 * Copyright (c) 2015, Codyy All Rights Reserved.
*/

package com.codyy.commons.utils.gson;

import com.google.gson.ExclusionStrategy;

/**
 * ClassName:FieldIncludeHelper Function: TODO
 *
 * @author xiongping
 * @Date 2015 2015年8月26日 下午5:19:17
 *
 */

public class FieldIncludeHelper {

	private FieldIncludeHelper() {

	}

	/**
	 * init:fieldNames 为空则全部不包含 
	 *
	 * @param fieldNames
	 * @param clazz
	 * @return
	 * @author xiongping
	 */
	public static ExclusionStrategy init(String[] fieldNames, Class<?> clazz) {
		return new FieldExclusionStrategyHelper(fieldNames, true, clazz);
	}

}
