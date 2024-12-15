---
title: C++ vs Java：Map容器的实现与应用
publishDate: 2024-09-18
description: '哈希与有序'
image: './C++-vs-Java.jpeg'
tags: []
category: '驽马十驾'
draft: false 
lang: ''
---
# 引言
作为一个C++程序员，最近在面试一个Java的岗位，发现很多Java面试中必问Map的问题，但是想要真正理解还是要自己来看源码，索性对比之前C++使用的经验来学习一下Java中的Map。 
C++和Java都提供了Map容器。C++在STL中主要有std::map和std::unordered_map；Java中主要有HashMap和TreeMap。本文将深入探讨这两种语言中Map的实现，以及源码中的核心数据结构——哈希表和红黑树。  
# 基于哈希表的无序容器  
## 哈希表
哈希表（散列表）是通过建立key和value的映射来实现高效查询的数据结构。  
例如数组实现的哈希表，每个空位是一个桶。key和value（桶）的关系就是哈希函数  
f(key) = hash(key) % capacity  
当多个key对应同一个value时，就产生了哈希冲突。避免哈希冲突或者说解决的方法主流有：  
- 哈希表扩容：capacity越大，hash(key) & capacity冲突概率越小  
- 链地址法：每个桶存储一个链表，存放所有冲突的元素  
- 开放寻址法：线性探测、平方探测、再哈希，存在不能直接删除元素的问题，只能设置为可继续遍历的空桶，哈希冲突过多的话，效率急剧变低。  

## C++ unordered_map
C++中std::unordered_map底层由HashTable实现,可以重载operator==()，是线程不安全的  
HashTable，也就是一连串的桶是STL的vector实现的，每个桶中的链表是单独维护的，并没有使用STL的list  
`vector<node*, Alloc> buckets`  
```cpp
template<typename _Key, typename _Tp,
	 typename _Hash = std::hash<_Key>,
	 typename _Pred = std::equal_to<_Key>,
	 typename _Alloc = std::allocator<std::pair<const _Key, _Tp> > >
class unordered_map
```
```bash
g++ -g hashmap.cc  -std=c++11 -o hashmap_test
gdbgui -r -p 8000 ./hashmap_test
```
来看一个最常见的查找的operator[]  
```cpp
template<typename _Key, typename _Pair, typename _Alloc, typename _Equal,
	typename _H1, typename _H2, typename _Hash,
	typename _RehashPolicy, typename _Traits>
	auto
	_Map_base<_Key, _Pair, _Alloc, _Select1st, _Equal,
	     _H1, _H2, _Hash, _RehashPolicy, _Traits, true>::
	operator[](key_type&& __k)
	-> mapped_type&
    {
      //通过底层Hashtable来查找
      __hashtable* __h = static_cast<__hashtable*>(this);
      //计算key对应的hash值
      __hash_code __code = __h->_M_hash_code(__k);
      //找到hash值对应的桶
      std::size_t __n = __h->_M_bucket_index(__k, __code);
      //在桶中查找key
      __node_type* __p = __h->_M_find_node(__n, __k, __code);
 
      if (!p)
      {
        //找不到就插入一个默认值返回
		__p = __h->_M_allocate_node(std::piecewise_construct,
		std::forward_as_tuple(std::move(__k)), std::tuple<>());
		return __h->_M_insert_unique_node(__n, __code, __p)->second;
      }
    
       return __p->_M_v().second;
    }
```

```cpp
_Hashtable<_Key, _Value, _Alloc, _ExtractKey, _Equal,
	_H1, _H2, _Hash, _RehashPolicy, _Traits>::
_M_insert_unique_node(size_type __bkt, __hash_code __code,
	__node_type* __node, size_type __n_elt)
-> iterator
{
    const __rehash_state& __saved_state = _M_rehash_policy._M_state(); //return _M_next_resize;
    //当load factor达到一定大小时，会自动扩容来降低load factor(size/bucker_count)
    //判断是否需要扩容重新计算hash
    std::pair<bool, std::size_t> __do_rehash
    = _M_rehash_policy._M_need_rehash(_M_bucket_count, _M_element_count, __n_elt);

    if (__do_rehash.first)
    {
        _M_rehash(__do_rehash.second, __saved_state);
        __bkt = _M_bucket_index(this->_M_extract()(__node->_M_v()), __code);
    }
    //把hash值存为一个新node
    this->_M_store_code(__node, __code);
    //头插法，插入链表
    _M_insert_bucket_begin(__bkt, __node);
    ++_M_element_count;
    return iterator(__node);
}
 
_M_insert_bucket_begin(size_type __bkt, __node_type* __node)
{
    if (_M_buckets[__bkt])
    {
        __node->_M_nxt = _M_buckets[__bkt]->_M_nxt;
        _M_buckets[__bkt]->_M_nxt = __node;
    }
    else
    {
        __node->_M_nxt = _M_before_begin._M_nxt;
        _M_before_begin._M_nxt = __node;
        if (__node->_M_nxt)
        {
            //头插法后，更新新节点的下一个节点的桶指针（哨兵前驱节点）
            //如果新节点后面还有其他节点，确保桶指向新插入的节点（更新哨兵节点）
            _M_buckets[_M_bucket_index(__node->_M_next())] = __node;
        }
        //将当前桶指向虚拟头节点 _M_before_begin，桶非空并指向链表的开始部分
        _M_buckets[__bkt] = &_M_before_begin;
    }
}
```
**_M_before_begin**是虚拟迭代器，通常叫哨兵节点，stl容器的begin()迭代器返回这个哨兵节点的下一个位置，简化了边界检查。  
## Java HashMap
线程不安全   
底层实现是java7是数组、链表，出现哈希冲突时，头插法插入单链表，并发环境下自动扩容可能会形成死链。  
java8实现是数组、链表或者红黑树，当出现哈希冲突过多，同一个链表（桶）中的元素超过8个且大小大于64，为了提高查找效率，单链表转为红黑树。尾插法插入单链表。  
HashMap将Objects存为Entry数组(相当于C++的Pair)  
`transient Entry[] table;`  
```java
 static class Entry<K,V> implements Map.Entry<K,V> 
 {
     final K key;
     V value;
     Entry<K,V> next;
     final int hash;
     ........
 }
```
同样来看一下put(相当于C++的[])  
```java
public V put(K key, V value) 
{
    if (key == null)
       return putForNullKey(value);
    //根据计算hash值
    int hash = hash(key.hashCode());
    //找到hash值对应的桶 ，HashMap的长度是2的幂次方，为了存取高效，还能让数据分配更均匀，减少碰撞
    int i = indexFor(hash, table.length);
    //遍历桶中所有的元素，找到要set的元素
    //尾插法
    for (Entry<K,V> e = table[i]; e != null; e = e.next) 
    {
        Object k;
        if (e.hash == hash && ((k = e.key) == key || key.equals(k))) 
         {
             V oldValue = e.value;
             e.value = value;
             e.recordAccess(this);
             return oldValue;
          }
     }
     modCount++;
     addEntry(hash, key, value, i);
     return null;
 }
```

### Java hashCode() & equals()
Java中每个对象都有两个比较的函数hashCode()和equals(),在hashmap使用时，hashCode()决定该对象存储在哪个桶，当两个不等的对象有相同的哈希值时（这是必然会发生的，因为哈希函数就是用来把大范围的数映射到小范围的），再使用equals对比存放到链表或者红黑树中。  
# 基于红黑树的有序容器

## 红黑树
二叉搜索树（BST）特点是左子树所有值小于根节点小于右子树所有值  
为了控制树的层数和节点位置，引入了平衡二叉树（AVL）和红黑树（RBT）  
















---
# Reference
[Hashing](https://samwho.dev/hashing/)

