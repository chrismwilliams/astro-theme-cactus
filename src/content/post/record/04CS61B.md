---
title: CS61B
publishDate: 2024-09-19
description: ''
image: ''
tags: [砍柴]
category: '驽马十驾'
draft: false 
lang: ''
---

记录CS61B学习过程中的心得和感受  
:::tip
版本：Josh Hug教课的指导书（也就是官网的Reading），统一用的是19sp的版本，里面有一些19（18）独有的lab，建议是跟着[21sp](https://sp21.datastructur.es/)的流程走，如果在reading中看到自己想强化的部分，就自己找每次reading最后的lab习题加练。  
资料：Reading基本上是Video的精华，如果看Reading有不理解的再去看对应的视频。  
作业批改（Autograder）：21版本 MB7ZPY  
:::
# 时间记录(目标10.31完成)
09-19 安装IntelliJ（激活）Lec1  
09-20 Lec2 HW0（Java基础） Pro0（2048）  
09-21 Lec3(Testing) Lec4(Recursion) Lec5(LinkedList)  
09-22 Lab2(Debugging) Lec6(双向链表) Lec7(线性表扩容) Lab3(条件断点，随机性测试)
09-23 Pro1.1(Linked List Deque)
09-24 Pro1.2(ArrayDeque, MaxArrayDeque)
09-25 Lec8(接口的实现) Lec9(类的继承) Lec10(比较器接口)
09-26 复习回顾Slides和Reading Lec11(Iterator,Equals,toString) Lab4(Git使用，游离态)
09-28 Lec14(DisjointSets 并查集)
10-06 Lec16(BST 二叉平衡树)

# 学习心得
# 第一阶段 Java基础  (8Days)
## 1week
Lec1,2介绍了main函数和一些基本的关键字、库用法。static关键字是区分是属于类还是实例的关键字。  
Josh还说出了我上学时讨厌Java的原因，看起来非常冗长，定义一个函数public static void main(String[] args)看起来比C++都要长，但他说长有长的坏处，在大型项目中会有优势，这让我开始静下心来敲每一行代码，慢慢熟悉Java的做事方法。  

## Pro0 2048
MVC框架完成了绝大多数功能，只让实现游戏结束条件和响应用户上下左右的按键。   
刚上手时候毫无头绪，看完Tips明白主要实现North方向的功能，就按照TDD（Test Driven Development）的思路来做。  
一个个测试执行，开始实现最简单的NoMerge的功能，就是按列来移动，找到对应的位置直接移动过去；  
第二个Case简单的Merge一次，就移动完之后，判断相邻的值是否相等，等的话就Merge；  
第三个Case是Merge两次，就再执行一次移动和Merge，也ok了；  
第四个Case是2 2 2 2 不能变成8，应该是4 4，我就知道之前的思路有问题了，核心就是移动和合并不能分的太开，不然Merge之后可能还会有要移动的需求，移动之后有合并的条件就一起做了，不然2 0 2 2 可能会变成 4 0 2 0  
核心代码
```java
    public boolean tilt(Side side) {
        boolean changed;
        changed = false;

        board.setViewingPerspective(side);//EAST  WEST
        for (int i = 0; i < board.size(); i++) {
            //move
            for (int j = board.size() - 1; j >= 0; j--) {
                int uhs = j;
                while (board.tile(i, uhs) == null) {
                    if (uhs == 0) {
                        break;
                    }
                    uhs--;
                }
                if (board.tile(i, uhs) == null)
                    break;
                if (uhs != j) {
                    Tile t = board.tile(i, uhs);
                    board.move(i, j, t);
                    changed = true;
                }
            }
            //merge and move
            for (int j = board.size() - 1; j >= 0; j--) {
                if (board.tile(i, j) == null)
                    break;

                if (j - 1 >= 0 && board.tile(i, j - 1) != null &&
                        board.tile(i, j - 1).value() == board.tile(i, j).value()) {
                    Tile t = board.tile(i, j - 1);
                    board.move(i, j, t);
                    score += t.value() * 2;
                    changed = true;
                    if (j-3>=0 && board.tile(i, j - 2) != null &&
                            board.tile(i, j - 3) != null &&
                            board.tile(i, j - 2).value() == board.tile(i, j-3).value()) {
                        Tile t2 = board.tile(i, j - 3);
                        board.move(i, j-2, t2);
                        score += t2.value() * 2;
                        t2 = board.tile(i, j - 2);
                        board.move(i, j-1, t2);
                    } else {
                        for (int o = j - 2; o >= 0; o--) {
                            if (board.tile(i, o) != null) {
                                Tile temp = board.tile(i, o);
                                board.move(i, o + 1, temp);
                            }
                        }
                    }
                }
            }
        }
        board.setViewingPerspective(Side.NORTH);
        checkGameOver();
        if (changed) {
            setChanged();
        }
        return changed;
    }
```
## 2week
Lec3（Testing）这节课给我感触很多，因为最近刚好准备过一个测试岗位的面试，讲的是TDD，也就是单元测试，用的是org.junit库,在不过度写单元测试的情况下，对于写代码的质量和效率提升都是很大的。顺便这节课还讲了递归实现选择排序。  
Lec4这节课就是为新程序员讲清楚值传递和地址传递的区别的，值传递时会复制，改变的是临时值，不会改变原本的值，针对基本数据类型。地址的话会一起改变，针对引用类型。  
Lec5这节课开始接触数据结构了，实现了一个简单的linkedlist，对于size方法给出了递归和迭代两种实现方式，引出了哨兵节点的必要性，让逻辑更统一，不必区分是否存在第一个节点。  
## 3week
Lec6 带有哨兵节点和last节点的单链表在删除尾部元素时的效率较低，自然而然地引出了双向链表，有两种实现形式。一种是前后哨兵节点的双向链表，另一种是带哨兵节点的循环链表。从array和class的使用对比中，引出了反射。  
Lec7 主要讨论读写效率更高的线性表，以及如何扩容。  
Lab3 主要熟练test case怎么写，随机性测试，条件断点以及crash断点的用法，说是会在之后的lab里用到。  
Lec8 接口
Lec9 继承
Lec10 C++的<可以重载，Java只能通过继承一个比较的接口来实现
Lec11 实现了一个带Iterator的ArraySet，又重载了equas和toString，相当于是==和cout

## Pro1
实现这个双端队列比我想象的要困难，原理感觉很清晰，写起来各种条件、限制，这时候真的需要一个好的case来提高验证效率。实现了Deque之后不想做后半部分了，Java的语言基础部分就算到这里了，接下来的数据结构部分才是重头戏。

---

# 第二部分 数据结构   
09-28 并查集
UnionFind，用来做连通性检查的数据结构。主要API是Find和Union（好像是废话），依次进化三次的算法：  
- 第一种纯数组记录，每个连通的节点都是同一个set的值，优点是Find非常快，O1，缺点是Union非常慢，需要一个个遍历，赋值；
- 第二种也是数组记录，但记录的是父节点的值，Find和Union的速度都取决于树的高度；
- 第三者加权Quick Union，除了第一个数组记录父节点，还有一个数组记录树的节点数，Union的时候，小树改变根节点到大树上，这样让树更加平衡，实现O logn的复杂度；
- 最后一种带路径压缩，查询的时候顺手把根节点直接指向root节点，这样不用一次次爬树到叶子节点上，适合操作多的时候能接近O1的常数时间复杂度。  
Leetcode547(省份) -> 200(岛屿)
```cpp
class Solution {
public:
    int findCircleNum(vector<vector<int>>& isConnected) {
        int n = isConnected.size();
        UnionFind* uf = new UnionFind(n);
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (isConnected[i][j] == 1) {
                    uf->Union(i, j);
                }
            }
        }
        return uf->GetMerged();
    }

    class UnionFind {
    public:
        UnionFind(int n) {
            merged = n;
            parents = new int[n];
            size = new int[n];
            for (int i = 0; i < n; i++) {
                parents[i] = i;
                size[i] = 1;
            }
        }
        int GetMerged() {
            return merged;
        }
        
        int Find(int i) {
            /*int r = i;
            while (parents[r] != r) {
                r = parents[r];
            }
            return r;*/
            if (parents[i] != i) {
                parents[i] = Find(parents[i]);
            }
            return parents[i];
        }
        void Union(int p, int q) {
            int lhs = Find(p);
            int rhs = Find(q);
            if (lhs != rhs) {
                merged--;
                if (lhs < rhs) {
                    parents[lhs] = rhs;
                    size[rhs] += size[lhs];
                }
                else {
                    parents[rhs] = lhs;
                    size[lhs] += size[rhs];
                }
            }
        }

        private:
            int* parents;
            int* size;
            int merged;
    };

};
```

------
期待[gitlet](https://cs-plan.com/CS%E5%9F%BA%E7%A1%80/%E8%AF%BE%E7%A8%8B%E6%8E%A8%E8%8D%90/%E7%AE%97%E6%B3%95%E5%9F%BA%E7%A1%80/UCBCS61B/#gitlet)