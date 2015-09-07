package com.codyy.oc.question.dao;

import com.codyy.oc.question.entity.BaseUser;

public interface BaseUserMapper {
    int deleteByPrimaryKey(String baseUserId);

    int insert(BaseUser record);

    int insertSelective(BaseUser record);

    BaseUser selectByPrimaryKey(String baseUserId);

    int updateByPrimaryKeySelective(BaseUser record);

    int updateByPrimaryKey(BaseUser record);
}