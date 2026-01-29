import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Problem, ProblemDocument } from './schemas/problem.schema';

/**
 * EXECUTION MODEL: PROGRAM-BASED
 * 
 * All problems use the Program-Based execution model:
 * - Every submission must be a complete, standalone program
 * - Program reads from stdin and writes to stdout
 * - All boilerplates include main() with driver code
 * 
 * This is identical to Codeforces, AtCoder, and ICPC style.
 */

@Injectable()
export class ProblemsService implements OnModuleInit {
    constructor(
        @InjectModel(Problem.name) private problemModel: Model<ProblemDocument>,
    ) { }

    async onModuleInit() {
        await this.seedProblems();
    }

    async findAll() {
        return this.problemModel.find().exec();
    }

    async findOne(id: string) {
        return this.problemModel.findById(id).exec();
    }

    private async seedProblems() {
        const problems = [
            // ============================================
            // PROBLEM 1: Two Sum
            // ============================================
            {
                title: 'Two Sum',
                description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.

**Approach Hints:**
- A brute force approach would check every pair of numbers, but this is O(n²).
- Consider using a hash map to store numbers you've seen, allowing O(1) lookups.
- Think about what you're looking for: if you need nums[i] + nums[j] = target, then for each nums[i], you're looking for target - nums[i].

**Input Format:**
- First line: space-separated integers representing the array
- Second line: the target integer

**Output Format:**
- The indices of the two numbers as [i, j]`,
                difficulty: 'Easy',
                constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9'],
                testCases: [
                    { input: '2 7 11 15\n9', expectedOutput: '[0, 1]', isHidden: false },
                    { input: '3 2 4\n6', expectedOutput: '[1, 2]', isHidden: false },
                    { input: '3 3\n6', expectedOutput: '[0, 1]', isHidden: false },
                    { input: '1 5 8 12\n13', expectedOutput: '[1, 2]', isHidden: true },
                    { input: '-1 -2 -3 -4 -5\n-8', expectedOutput: '[2, 4]', isHidden: true },
                    { input: '0 4 3 0\n0', expectedOutput: '[0, 3]', isHidden: true },
                ],
                boilerplates: {
                    python: `import sys

def two_sum(nums, target):
    # Your solution here
    # Return a list of two indices
    pass

if __name__ == "__main__":
    data = sys.stdin.read().split()
    # Last element is target, rest are nums
    target = int(data[-1])
    nums = [int(x) for x in data[:-1]]
    result = two_sum(nums, target)
    print(f"[{result[0]}, {result[1]}]")
`,
                    cpp: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // Your solution here
    // Return vector of two indices
    return {};
}

int main() {
    vector<int> nums;
    int n;
    while (cin >> n) nums.push_back(n);
    int target = nums.back();
    nums.pop_back();
    
    vector<int> result = twoSum(nums, target);
    cout << "[" << result[0] << ", " << result[1] << "]" << endl;
    return 0;
}
`,
                    java: `import java.util.*;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        // Your solution here
        // Return array of two indices
        return new int[]{0, 0};
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        List<Integer> list = new ArrayList<>();
        while (sc.hasNextInt()) list.add(sc.nextInt());
        
        int target = list.remove(list.size() - 1);
        int[] nums = list.stream().mapToInt(i -> i).toArray();
        
        int[] result = twoSum(nums, target);
        System.out.println("[" + result[0] + ", " + result[1] + "]");
    }
}
`,
                    javascript: `const fs = require('fs');
const input = fs.readFileSync(0, 'utf8').trim().split(/\\s+/).map(Number);

function twoSum(nums, target) {
    // Your solution here
    // Return array of two indices
    return [0, 0];
}

const target = input.pop();
const result = twoSum(input, target);
console.log(\`[\${result[0]}, \${result[1]}]\`);
`,
                    go: `package main

import (
    "bufio"
    "fmt"
    "os"
    "strconv"
    "strings"
)

func twoSum(nums []int, target int) []int {
    // Your solution here
    return []int{0, 0}
}

func main() {
    scanner := bufio.NewScanner(os.Stdin)
    scanner.Split(bufio.ScanWords)
    var nums []int
    for scanner.Scan() {
        n, _ := strconv.Atoi(scanner.Text())
        nums = append(nums, n)
    }
    target := nums[len(nums)-1]
    nums = nums[:len(nums)-1]
    
    result := twoSum(nums, target)
    fmt.Printf("[%d, %d]\\n", result[0], result[1])
}
`,
                },
            },
            // ============================================
            // PROBLEM 2: Reverse Integer
            // ============================================
            {
                title: 'Reverse Integer',
                description: `Given a signed 32-bit integer x, return x with its digits reversed. If reversing x causes the value to go outside the signed 32-bit integer range [-2³¹, 2³¹ - 1], then return 0.

**Important Notes:**
- The environment does not allow you to store 64-bit integers.
- Handle negative numbers correctly (they should remain negative after reversal).
- Watch out for integer overflow! The reversed number might exceed 32-bit limits.

**Approach Hints:**
- Extract digits using modulo (%) and division (/).
- Build the reversed number digit by digit.
- Check for overflow BEFORE it happens, not after.

**Input Format:**
- A single integer x

**Output Format:**
- The reversed integer, or 0 if overflow occurs`,
                difficulty: 'Medium',
                constraints: ['-2^31 <= x <= 2^31 - 1', 'Environment cannot store 64-bit integers'],
                testCases: [
                    { input: '123', expectedOutput: '321', isHidden: false },
                    { input: '-123', expectedOutput: '-321', isHidden: false },
                    { input: '120', expectedOutput: '21', isHidden: false },
                    { input: '0', expectedOutput: '0', isHidden: true },
                    { input: '1534236469', expectedOutput: '0', isHidden: true },
                    { input: '-2147483648', expectedOutput: '0', isHidden: true },
                ],
                boilerplates: {
                    python: `import sys

def reverse(x):
    # Your solution here
    pass

if __name__ == "__main__":
    x = int(sys.stdin.read().strip())
    print(reverse(x))
`,
                    cpp: `#include <iostream>
#include <climits>
using namespace std;

int reverse(int x) {
    // Your solution here
    return 0;
}

int main() {
    int x;
    cin >> x;
    cout << reverse(x) << endl;
    return 0;
}
`,
                    java: `import java.util.*;

public class Main {
    public static int reverse(int x) {
        // Your solution here
        return 0;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int x = sc.nextInt();
        System.out.println(reverse(x));
    }
}
`,
                },
            },
            // ============================================
            // PROBLEM 3: Valid Parentheses
            // ============================================
            {
                title: 'Valid Parentheses',
                description: 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets. Open brackets must be closed in the correct order.',
                difficulty: 'Easy',
                constraints: ['1 <= s.length <= 10^4', 's consists of parentheses only'],
                testCases: [
                    { input: '()', expectedOutput: 'true', isHidden: false },
                    { input: '()[]{}', expectedOutput: 'true', isHidden: false },
                    { input: '(]', expectedOutput: 'false', isHidden: false },
                    { input: '([)]', expectedOutput: 'false', isHidden: true },
                    { input: '{[]}', expectedOutput: 'true', isHidden: true },
                    { input: '(', expectedOutput: 'false', isHidden: true },
                ],
                boilerplates: {
                    python: `import sys

def is_valid(s):
    # Your solution here
    pass

if __name__ == "__main__":
    s = sys.stdin.read().strip()
    print("true" if is_valid(s) else "false")
`,
                    cpp: `#include <iostream>
#include <string>
#include <stack>
using namespace std;

bool isValid(string s) {
    // Your solution here
    return false;
}

int main() {
    string s;
    cin >> s;
    cout << (isValid(s) ? "true" : "false") << endl;
    return 0;
}
`,
                    java: `import java.util.*;

public class Main {
    public static boolean isValid(String s) {
        // Your solution here
        return false;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.next();
        System.out.println(isValid(s) ? "true" : "false");
    }
}
`,
                },
            },
            // ============================================
            // PROBLEM 4: Palindrome Number
            // ============================================
            {
                title: 'Palindrome Number',
                description: 'Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.',
                difficulty: 'Easy',
                constraints: ['-2^31 <= x <= 2^31 - 1'],
                testCases: [
                    { input: '121', expectedOutput: 'true', isHidden: false },
                    { input: '-121', expectedOutput: 'false', isHidden: false },
                    { input: '10', expectedOutput: 'false', isHidden: false },
                    { input: '0', expectedOutput: 'true', isHidden: true },
                    { input: '12321', expectedOutput: 'true', isHidden: true },
                    { input: '1000021', expectedOutput: 'false', isHidden: true },
                ],
                boilerplates: {
                    python: `import sys

def is_palindrome(x):
    # Your solution here
    pass

if __name__ == "__main__":
    x = int(sys.stdin.read().strip())
    print("true" if is_palindrome(x) else "false")
`,
                    cpp: `#include <iostream>
using namespace std;

bool isPalindrome(int x) {
    // Your solution here
    return false;
}

int main() {
    int x;
    cin >> x;
    cout << (isPalindrome(x) ? "true" : "false") << endl;
    return 0;
}
`,
                    java: `import java.util.*;

public class Main {
    public static boolean isPalindrome(int x) {
        // Your solution here
        return false;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int x = sc.nextInt();
        System.out.println(isPalindrome(x) ? "true" : "false");
    }
}
`,
                },
            },
            // ============================================
            // PROBLEM 5: Climbing Stairs
            // ============================================
            {
                title: 'Climbing Stairs',
                description: 'You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
                difficulty: 'Easy',
                constraints: ['1 <= n <= 45'],
                testCases: [
                    { input: '2', expectedOutput: '2', isHidden: false },
                    { input: '3', expectedOutput: '3', isHidden: false },
                    { input: '4', expectedOutput: '5', isHidden: false },
                    { input: '1', expectedOutput: '1', isHidden: true },
                    { input: '10', expectedOutput: '89', isHidden: true },
                    { input: '45', expectedOutput: '1836311903', isHidden: true },
                ],
                boilerplates: {
                    python: `import sys

def climb_stairs(n):
    # Your solution here
    pass

if __name__ == "__main__":
    n = int(sys.stdin.read().strip())
    print(climb_stairs(n))
`,
                    cpp: `#include <iostream>
using namespace std;

int climbStairs(int n) {
    // Your solution here
    return 0;
}

int main() {
    int n;
    cin >> n;
    cout << climbStairs(n) << endl;
    return 0;
}
`,
                    java: `import java.util.*;

public class Main {
    public static int climbStairs(int n) {
        // Your solution here
        return 0;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        System.out.println(climbStairs(n));
    }
}
`,
                },
            },
            // ============================================
            // PROBLEM 6: Maximum Subarray
            // ============================================
            {
                title: 'Maximum Subarray',
                description: 'Given an integer array `nums`, find the subarray with the largest sum, and return its sum.',
                difficulty: 'Medium',
                constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
                testCases: [
                    { input: '-2 1 -3 4 -1 2 1 -5 4', expectedOutput: '6', isHidden: false },
                    { input: '1', expectedOutput: '1', isHidden: false },
                    { input: '5 4 -1 7 8', expectedOutput: '23', isHidden: false },
                    { input: '-1', expectedOutput: '-1', isHidden: true },
                    { input: '-2 -1', expectedOutput: '-1', isHidden: true },
                    { input: '1 2 3 4 5', expectedOutput: '15', isHidden: true },
                ],
                boilerplates: {
                    python: `import sys

def max_subarray(nums):
    # Your solution here (Kadane's algorithm)
    pass

if __name__ == "__main__":
    nums = list(map(int, sys.stdin.read().split()))
    print(max_subarray(nums))
`,
                    cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int maxSubArray(vector<int>& nums) {
    // Your solution here
    return 0;
}

int main() {
    vector<int> nums;
    int n;
    while (cin >> n) nums.push_back(n);
    cout << maxSubArray(nums) << endl;
    return 0;
}
`,
                    java: `import java.util.*;

public class Main {
    public static int maxSubArray(int[] nums) {
        // Your solution here
        return 0;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        List<Integer> list = new ArrayList<>();
        while (sc.hasNextInt()) list.add(sc.nextInt());
        int[] nums = list.stream().mapToInt(i -> i).toArray();
        System.out.println(maxSubArray(nums));
    }
}
`,
                },
            },
            // ============================================
            // PROBLEM 7: Contains Duplicate
            // ============================================
            {
                title: 'Contains Duplicate',
                description: 'Given an integer array `nums`, return `true` if any value appears at least twice in the array, and return `false` if every element is distinct.',
                difficulty: 'Easy',
                constraints: ['1 <= nums.length <= 10^5', '-10^9 <= nums[i] <= 10^9'],
                testCases: [
                    { input: '1 2 3 1', expectedOutput: 'true', isHidden: false },
                    { input: '1 2 3 4', expectedOutput: 'false', isHidden: false },
                    { input: '1 1 1 3 3 4 3 2 4 2', expectedOutput: 'true', isHidden: false },
                    { input: '1', expectedOutput: 'false', isHidden: true },
                    { input: '1 2', expectedOutput: 'false', isHidden: true },
                    { input: '1 1', expectedOutput: 'true', isHidden: true },
                ],
                boilerplates: {
                    python: `import sys

def contains_duplicate(nums):
    # Your solution here
    pass

if __name__ == "__main__":
    nums = list(map(int, sys.stdin.read().split()))
    print("true" if contains_duplicate(nums) else "false")
`,
                    cpp: `#include <iostream>
#include <vector>
#include <unordered_set>
using namespace std;

bool containsDuplicate(vector<int>& nums) {
    // Your solution here
    return false;
}

int main() {
    vector<int> nums;
    int n;
    while (cin >> n) nums.push_back(n);
    cout << (containsDuplicate(nums) ? "true" : "false") << endl;
    return 0;
}
`,
                    java: `import java.util.*;

public class Main {
    public static boolean containsDuplicate(int[] nums) {
        // Your solution here
        return false;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        List<Integer> list = new ArrayList<>();
        while (sc.hasNextInt()) list.add(sc.nextInt());
        int[] nums = list.stream().mapToInt(i -> i).toArray();
        System.out.println(containsDuplicate(nums) ? "true" : "false");
    }
}
`,
                },
            },
            // ============================================
            // PROBLEM 8: FizzBuzz
            // ============================================
            {
                title: 'FizzBuzz',
                description: 'Given an integer `n`, return a string array `answer` (1-indexed) where: answer[i] == "FizzBuzz" if i is divisible by 3 and 5, answer[i] == "Fizz" if i is divisible by 3, answer[i] == "Buzz" if i is divisible by 5, answer[i] == i (as a string) if none of the above conditions are true.',
                difficulty: 'Easy',
                constraints: ['1 <= n <= 10^4'],
                testCases: [
                    { input: '3', expectedOutput: '1 2 Fizz', isHidden: false },
                    { input: '5', expectedOutput: '1 2 Fizz 4 Buzz', isHidden: false },
                    { input: '15', expectedOutput: '1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz', isHidden: false },
                    { input: '1', expectedOutput: '1', isHidden: true },
                    { input: '2', expectedOutput: '1 2', isHidden: true },
                ],
                boilerplates: {
                    python: `import sys

def fizz_buzz(n):
    # Your solution here
    # Return a list of strings
    pass

if __name__ == "__main__":
    n = int(sys.stdin.read().strip())
    print(" ".join(fizz_buzz(n)))
`,
                    cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

vector<string> fizzBuzz(int n) {
    // Your solution here
    return {};
}

int main() {
    int n;
    cin >> n;
    vector<string> result = fizzBuzz(n);
    for (int i = 0; i < result.size(); i++) {
        if (i > 0) cout << " ";
        cout << result[i];
    }
    cout << endl;
    return 0;
}
`,
                    java: `import java.util.*;

public class Main {
    public static List<String> fizzBuzz(int n) {
        // Your solution here
        return new ArrayList<>();
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        List<String> result = fizzBuzz(n);
        System.out.println(String.join(" ", result));
    }
}
`,
                },
            },
            // ============================================
            // PROBLEM 9: Single Number
            // ============================================
            {
                title: 'Single Number',
                description: 'Given a non-empty array of integers `nums`, every element appears twice except for one. Find that single one. You must implement a solution with a linear runtime complexity and use only constant extra space.',
                difficulty: 'Easy',
                constraints: ['1 <= nums.length <= 3 * 10^4', '-3 * 10^4 <= nums[i] <= 3 * 10^4', 'Each element appears twice except for one element which appears once.'],
                testCases: [
                    { input: '2 2 1', expectedOutput: '1', isHidden: false },
                    { input: '4 1 2 1 2', expectedOutput: '4', isHidden: false },
                    { input: '1', expectedOutput: '1', isHidden: false },
                    { input: '1 0 1', expectedOutput: '0', isHidden: true },
                    { input: '-1 -1 -2', expectedOutput: '-2', isHidden: true },
                ],
                boilerplates: {
                    python: `import sys

def single_number(nums):
    # Your solution here (hint: XOR)
    pass

if __name__ == "__main__":
    nums = list(map(int, sys.stdin.read().split()))
    print(single_number(nums))
`,
                    cpp: `#include <iostream>
#include <vector>
using namespace std;

int singleNumber(vector<int>& nums) {
    // Your solution here
    return 0;
}

int main() {
    vector<int> nums;
    int n;
    while (cin >> n) nums.push_back(n);
    cout << singleNumber(nums) << endl;
    return 0;
}
`,
                    java: `import java.util.*;

public class Main {
    public static int singleNumber(int[] nums) {
        // Your solution here
        return 0;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        List<Integer> list = new ArrayList<>();
        while (sc.hasNextInt()) list.add(sc.nextInt());
        int[] nums = list.stream().mapToInt(i -> i).toArray();
        System.out.println(singleNumber(nums));
    }
}
`,
                },
            },
            // ============================================
            // PROBLEM 10: Binary Search
            // ============================================
            {
                title: 'Binary Search',
                description: 'Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return `-1`.',
                difficulty: 'Easy',
                constraints: ['1 <= nums.length <= 10^4', '-10^4 < nums[i], target < 10^4', 'All the integers in nums are unique', 'nums is sorted in ascending order'],
                testCases: [
                    { input: '-1 0 3 5 9 12\n9', expectedOutput: '4', isHidden: false },
                    { input: '-1 0 3 5 9 12\n2', expectedOutput: '-1', isHidden: false },
                    { input: '5\n5', expectedOutput: '0', isHidden: false },
                    { input: '2 5\n5', expectedOutput: '1', isHidden: true },
                    { input: '1 2 3 4 5\n1', expectedOutput: '0', isHidden: true },
                    { input: '1 2 3 4 5\n6', expectedOutput: '-1', isHidden: true },
                ],
                boilerplates: {
                    python: `import sys

def binary_search(nums, target):
    # Your solution here
    pass

if __name__ == "__main__":
    lines = sys.stdin.read().strip().split('\\n')
    nums = list(map(int, lines[0].split()))
    target = int(lines[1])
    print(binary_search(nums, target))
`,
                    cpp: `#include <iostream>
#include <vector>
#include <sstream>
using namespace std;

int binarySearch(vector<int>& nums, int target) {
    // Your solution here
    return -1;
}

int main() {
    string line;
    getline(cin, line);
    stringstream ss(line);
    vector<int> nums;
    int n;
    while (ss >> n) nums.push_back(n);
    
    int target;
    cin >> target;
    
    cout << binarySearch(nums, target) << endl;
    return 0;
}
`,
                    java: `import java.util.*;

public class Main {
    public static int binarySearch(int[] nums, int target) {
        // Your solution here
        return -1;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String[] parts = sc.nextLine().split(" ");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);
        int target = sc.nextInt();
        System.out.println(binarySearch(nums, target));
    }
}
`,
                },
            },
            // ============================================
            // PROBLEM 11: Merge Intervals
            // ============================================
            {
                title: 'Merge Intervals',
                description: 'Given an array of `intervals` where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.',
                difficulty: 'Medium',
                constraints: ['1 <= intervals.length <= 10^4', 'intervals[i].length == 2', '0 <= starti <= endi <= 10^4'],
                testCases: [
                    { input: '1 3 2 6 8 10 15 18', expectedOutput: '1 6 8 10 15 18', isHidden: false },
                    { input: '1 4 4 5', expectedOutput: '1 5', isHidden: false },
                ],
                boilerplates: {
                    python: `import sys

def merge_intervals(intervals):
    # Your solution here
    pass

if __name__ == "__main__":
    data = list(map(int, sys.stdin.read().split()))
    intervals = []
    for i in range(0, len(data), 2):
        intervals.append([data[i], data[i+1]])
    result = merge_intervals(intervals)
    for interval in result:
        print(f"{interval[0]} {interval[1]}", end=" ")
`,
                    cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

vector<vector<int>> merge(vector<vector<int>>& intervals) {
    // Your solution here
    return {};
}

int main() {
    vector<int> data;
    int n;
    while (cin >> n) data.push_back(n);
    vector<vector<int>> intervals;
    for (size_t i = 0; i < data.size(); i += 2) {
        intervals.push_back({data[i], data[i+1]});
    }
    vector<vector<int>> result = merge(intervals);
    for (size_t i = 0; i < result.size(); ++i) {
        if (i > 0) cout << " ";
        cout << result[i][0] << " " << result[i][1];
    }
    cout << endl;
    return 0;
}
`,
                },
            },
            // ============================================
            // PROBLEM 12: Valid Anagram
            // ============================================
            {
                title: 'Valid Anagram',
                description: 'Given two strings s and t, return true if t is an anagram of s, and false otherwise. An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.',
                difficulty: 'Easy',
                constraints: ['1 <= s.length, t.length <= 5 * 10^4', 's and t consist of lowercase English letters.'],
                testCases: [
                    { input: 'anagram nagaram', expectedOutput: 'true', isHidden: false },
                    { input: 'rat car', expectedOutput: 'false', isHidden: false },
                ],
                boilerplates: {
                    python: `import sys

def is_anagram(s, t):
    # Your solution here
    pass

if __name__ == "__main__":
    s, t = sys.stdin.read().split()
    print("true" if is_anagram(s, t) else "false")
`,
                    cpp: `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

bool isAnagram(string s, string t) {
    // Your solution here
    return false;
}

int main() {
    string s, t;
    cin >> s >> t;
    cout << (isAnagram(s, t) ? "true" : "false") << endl;
    return 0;
}
`,
                },
            },
            // ============================================
            // PROBLEM 13: Group Anagrams
            // ============================================
            {
                title: 'Group Anagrams',
                description: 'Given an array of strings strs, group the anagrams together. You can return the answer in any order.',
                difficulty: 'Medium',
                constraints: ['1 <= strs.length <= 10^4', '0 <= strs[i].length <= 100', 'strs[i] consists of lowercase English letters.'],
                testCases: [
                    { input: 'eat tea tan ate nat bat', expectedOutput: '[["bat"],["nat","tan"],["ate","eat","tea"]]', isHidden: false },
                    { input: '', expectedOutput: '[[""]]', isHidden: false },
                    { input: 'a', expectedOutput: '[["a"]]', isHidden: false },
                ],
                boilerplates: {
                    python: `import sys
import json

def group_anagrams(strs):
    # Your solution here
    pass

if __name__ == "__main__":
    strs = sys.stdin.read().split()
    print(group_anagrams(strs))
`,
                    cpp: `#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <algorithm>
using namespace std;

vector<vector<string>> groupAnagrams(vector<string>& strs) {
    // Your solution here
    return {};
}

int main() {
    vector<string> strs;
    string s;
    while (cin >> s) strs.push_back(s);
    return 0;
}
`,
                },
            },
            // ============================================
            // PROBLEM 14: Trapping Rain Water
            // ============================================
            {
                title: 'Trapping Rain Water',
                description: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
                difficulty: 'Hard',
                constraints: ['n == height.length', '1 <= n <= 2 * 10^4', '0 <= height[i] <= 10^5'],
                testCases: [
                    { input: '0 1 0 2 1 0 1 3 2 1 2 1', expectedOutput: '6', isHidden: false },
                    { input: '4 2 0 3 2 5', expectedOutput: '9', isHidden: false },
                ],
                boilerplates: {
                    python: `import sys

def trap(height):
    # Your solution here
    pass

if __name__ == "__main__":
    height = list(map(int, sys.stdin.read().split()))
    print(trap(height))
`,
                    cpp: `#include <iostream>
#include <vector>
using namespace std;

int trap(vector<int>& height) {
    // Your solution here
    return 0;
}

int main() {
    vector<int> height;
    int h;
    while (cin >> h) height.push_back(h);
    cout << trap(height) << endl;
    return 0;
}
`,
                },
            },
            // ============================================
            // PROBLEM 15: Longest Palindromic Substring
            // ============================================
            {
                title: 'Longest Palindromic Substring',
                description: 'Given a string s, return the longest palindromic substring in s.',
                difficulty: 'Medium',
                constraints: ['1 <= s.length <= 1000', 's consist of only digits and English letters.'],
                testCases: [
                    { input: 'babad', expectedOutput: 'bab', isHidden: false },
                    { input: 'cbbd', expectedOutput: 'bb', isHidden: false },
                ],
                boilerplates: {
                    python: `import sys

def longest_palindrome(s):
    # Your solution here
    pass

if __name__ == "__main__":
    s = sys.stdin.read().strip()
    print(longest_palindrome(s))
`,
                    cpp: `#include <iostream>
#include <string>
#include <vector>
using namespace std;

string longestPalindrome(string s) {
    // Your solution here
    return "";
}

int main() {
    string s;
    cin >> s;
    cout << longestPalindrome(s) << endl;
    return 0;
}
`,
                },
            },
        ];

        let seededCount = 0;
        for (const problem of problems) {
            try {
                await this.problemModel.updateOne(
                    { title: problem.title },
                    { $set: problem },
                    { upsert: true }
                );
                seededCount++;
            } catch (err) {
                console.error(`Failed to seed problem: ${problem.title}`, err);
            }
        }
        console.log(`✅ Synchronized ${seededCount} problems with database`);
    }
}
