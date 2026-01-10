"""
Exam 2021, 8.00-13.00 for the course 1MS041 (Introduction to Data Science / Introduktion till dataanalys)

Instructions:
1. Complete the problems by following instructions.
2. When done, submit this file with your solutions saved, following the instruction sheet.

This exam has 3 problems for a total of 40 points, to pass you need 20 points.

Some general hints and information:
* Try to answer all questions even if you are uncertain.
* Comment your code, so that if you get the wrong answer I can understand how you thought
  this can give you some points even though the code does not run.
* Follow the instruction sheet rigorously.
* This exam is partially autograded, but your code and your free text answers are manually graded anonymously.
* If there are any questions, please ask the exam guards, they will escalate it to me if necessary.
* I (Benny) will visit the exam room at around 10:30 to see if there are any questions.

Tips for free text answers:
* Be VERY clear with your reasoning, there should be zero ambiguity in what you are referring to.
* If you want to include math, you can write LaTeX in the Markdown cells, for instance `$f(x)=x^2$` will be rendered as f(x)=x^2
  and `$$f(x) = x^2$$` will become an equation line.

Finally some rules:
* You may not communicate with others during the exam, for example:
    * You cannot ask for help in Stack-Overflow or other such help forums during the Exam.
    * You may not communicate with AI's, for instance ChatGPT.
    * Your on-line and off-line activity is being monitored according to the examination rules.

Good luck!
"""

# Insert your anonymous exam ID as a string in the variable below
examID = "SOLVED_EXAM_2022"

# Import necessary modules
from math import comb, sqrt, log, pi, sin, e
import numpy as np

# =============================================================================
# Exam vB, PROBLEM 1
# Maximum Points = 8
# =============================================================================

"""
Probability warmup

Let's say we have an exam question which consists of 20 yes/no questions. 
From past performance of similar students, a randomly chosen student will know the correct answer 
to N ~ binom(20,11/20) questions. Furthermore, we assume that the student will guess the answer 
with equal probability to each question they don't know the answer to, i.e. given N we define 
Z ~ binom(20-N,1/2) as the number of correctly guessed answers. Define Y = N + Z, i.e., Y represents 
the number of total correct answers.

We are interested in setting a deterministic threshold T, i.e., we would pass a student at threshold T 
if Y >= T. Here T in {0,1,2,...,20}.

1. [5p] For each threshold T, compute the probability that the student *knows* less than 10 correct 
   answers given that the student passed, i.e., N < 10. Put the answer in `problem11_probabilities` as a list.
2. [3p] What is the smallest value of T such that if Y >= T then we are 90% certain that N >= 10?
"""

# Hint the PMF of N is p_N(k) where p_N is
p = 11/20
# Using math.comb instead of SageMath's binomial
def binomial_pmf(n, k, prob):
    """Compute binomial PMF: C(n,k) * prob^k * (1-prob)^(n-k)"""
    if k < 0 or k > n:
        return 0.0
    return comb(n, k) * (prob ** k) * ((1 - prob) ** (n - k))

p_N = lambda k: binomial_pmf(20, k, p)

# Helper functions to compute the conditional probability
def compute_joint_prob_Y_N(y, n, prob=11/20):
    """Compute P(Y=y, N=n) = P(N=n) * P(Z=y-n | N=n)"""
    if n < 0 or n > 20:
        return 0.0
    z = y - n
    if z < 0 or z > (20 - n):
        return 0.0
    p_N_val = binomial_pmf(20, n, prob)
    p_Z_given_N = binomial_pmf(20 - n, z, 0.5)
    return p_N_val * p_Z_given_N

def compute_prob_N_lt_10_given_Y_geq_T(T, prob=11/20):
    """Compute P(N < 10 | Y >= T)"""
    # P(Y >= T)
    p_Y_geq_T = sum(sum(compute_joint_prob_Y_N(y, n, prob) for n in range(21)) for y in range(T, 21))
    if p_Y_geq_T == 0:
        return 0.0
    # P(N < 10, Y >= T)
    p_N_lt_10_and_Y_geq_T = sum(sum(compute_joint_prob_Y_N(y, n, prob) for n in range(10)) for y in range(T, 21))
    return p_N_lt_10_and_Y_geq_T / p_Y_geq_T

# Part 1: Compute P(N < 10 | Y >= T) for T = 0, 1, ..., 20
problem11_probabilities = [compute_prob_N_lt_10_given_Y_geq_T(T) for T in range(21)]

# Part 2: Find smallest T such that P(N >= 10 | Y >= T) >= 0.9
# This means P(N < 10 | Y >= T) <= 0.1
problem12_T = next(T for T in range(21) if 1 - problem11_probabilities[T] >= 0.9)

# =============================================================================
# Exam vB, PROBLEM 2
# Maximum Points = 8
# =============================================================================

"""
Random variable generation and transformation

The purpose of this problem is to show that you can implement your own sampler, this will be built 
in the following three steps:

1. [2p] Implement a Linear Congruential Generator where you tested out a good combination (a large M 
   with a,b satisfying the Hull-Dobell (Thm 6.8)) of parameters. Follow the instructions in the code block.
2. [2p] Using a generator construct random numbers from the uniform [0,1] distribution.
3. [4p] Using a uniform [0,1] random generator, generate samples from 

   p_0(x) = (pi/2)*|sin(2*pi*x)|, x in [0,1]

   Using the Accept-Reject sampler (Algorithm 1 in TFDS notes) with sampling density given by 
   the uniform [0,1] distribution.
"""

def problem2_LCG(size=None, seed=0):
    """
    A linear congruential generator that generates pseudo random numbers according to size.

    Parameters
    -------------
    size : an integer denoting how many samples should be produced
    seed : the starting point of the LCG, i.e. u0 in the notes.

    Returns
    -------------
    out : a list of the pseudo random numbers
    """
    # Using parameters that satisfy Hull-Dobell theorem (Thm 6.8):
    # - M is large (2^31)
    # - b and M are coprime (12345 is odd, coprime with 2^31)
    # - a-1 is divisible by all prime factors of M (a-1 = 1103515244 is divisible by 2)
    # - Since M is divisible by 4, a-1 must also be divisible by 4 (1103515244 % 4 = 0)
    # These are the glibc parameters, widely used and well-tested
    M = 2**31
    a = 1103515245
    b = 12345

    results = []
    x = seed
    for _ in range(size):
        x = (a * x + b) % M
        results.append(x)

    return results


def problem2_uniform(generator=None, period=1, size=None, seed=0):
    """
    Takes a generator and produces samples from the uniform [0,1] distribution according
    to size.

    Parameters
    -------------
    generator : a function of type generator(size,seed) and produces the same result as problem2_LCG,
                i.e. pseudo random numbers in the range {0,1,...,period-1}
    period : the period of the generator
    seed : the seed to be used in the generator provided
    size : an integer denoting how many samples should be produced

    Returns
    --------------
    out : a list of the uniform pseudo random numbers
    """
    # Get raw samples from the generator
    raw_samples = generator(size=size, seed=seed)

    # Divide by period to get values in [0, 1)
    uniform_samples = [x / period for x in raw_samples]

    return uniform_samples


def problem2_accept_reject(uniformGenerator=None, size=None, seed=0):
    """
    Takes a generator that produces uniform pseudo random [0,1] numbers
    and produces samples from (pi/2)*abs(sin(x*2*pi)) using an Accept-Reject
    sampler with the uniform distribution as the proposal distribution

    Parameters
    -------------
    generator : a function of the type generator(size,seed) that produces uniform pseudo random
                numbers from [0,1]
    seed : the seed to be used in the generator provided
    size : an integer denoting how many samples should be produced

    Returns
    --------------
    out : a list of the pseudo random numbers with the specified distribution
    """
    # Target density: p_0(x) = (pi/2) * |sin(2*pi*x)|
    # Proposal density: q(x) = 1 (uniform on [0,1])
    #
    # c = max{p_0(x)/q(x)} = max{(pi/2) * |sin(2*pi*x)|} = pi/2
    # (maximum occurs at x = 1/4 and x = 3/4 where |sin(2*pi*x)| = 1)
    #
    # Accept-Reject algorithm:
    # 1. Generate X ~ Uniform[0,1] (proposal)
    # 2. Generate U ~ Uniform[0,1]
    # 3. Accept X if U <= p_0(X) / (c * q(X)) = |sin(2*pi*X)|

    c = pi / 2  # max value of target density

    samples = []
    current_seed = seed

    while len(samples) < size:
        # We need 2 uniform samples per iteration: one for proposal X, one for U
        # Generate enough samples in batches (oversample due to rejection)
        n_needed = (size - len(samples)) * 4
        uniform_samples = uniformGenerator(size=n_needed, seed=current_seed)
        current_seed += n_needed  # Change seed for next batch

        i = 0
        while i + 1 < len(uniform_samples) and len(samples) < size:
            X = uniform_samples[i]      # Proposal sample
            U = uniform_samples[i + 1]  # For acceptance decision

            # Acceptance ratio: p_0(X) / (c * q(X)) = (pi/2)*|sin(2*pi*X)| / (pi/2) = |sin(2*pi*X)|
            acceptance_ratio = abs(sin(2 * pi * X))

            if U <= acceptance_ratio:
                samples.append(X)

            i += 2

    return samples


# Local Test for Exam vB, PROBLEM 2
# If you managed to solve all three parts you can test the following code to see if it runs
# you have to change the period to match your LCG though, this is marked as XXX.
# It is a very good idea to check these things using the histogram function in sagemath
# try with a larger number of samples, up to 10000 should run

if __name__ == "__main__":
    print("LCG output: %s" % problem2_LCG(size=10, seed=1))

    period = 2**31  # Period matches the M value in our LCG

    print("Uniform sampler %s" % problem2_uniform(generator=problem2_LCG, period=period, size=10, seed=1))

    uniform_sampler = lambda size, seed: problem2_uniform(generator=problem2_LCG, period=period, size=size, seed=seed)

    print("Accept-Reject sampler %s" % problem2_accept_reject(uniformGenerator=uniform_sampler, size=20, seed=1))

# If however you did not manage to implement either part 1 or part 2 but still want to check part 3, you can run the code below

# def testUniformGenerator(size,seed):
#     set_random_seed(seed)
#
#     return [random() for s in range(size)]
#
# print("Accept-Reject sampler %s" % problem2_accept_reject(uniformGenerator=testUniformGenerator, n_iterations=20, seed=1))

# =============================================================================
# Exam vB, PROBLEM 3
# Maximum Points = 8
# =============================================================================

"""
Concentration of measure

As you recall, we said that concentration of measure was simply the phenomenon where we expect that 
the probability of a large deviation of some quantity becoming smaller as we observe more samples: 
[0.4 points per correct answer]

1. Which of the following will exponentially concentrate, i.e. for some C_1,C_2,C_3,C_4 
   P(Z - E[Z] >= epsilon) <= C_1 * exp(-C_2 * n * epsilon^2) AND C_3 * exp(-C_4 * n * (epsilon+1))

    1. The empirical mean of i.i.d. sub-Gaussian random variables?
    2. The empirical mean of i.i.d. sub-Exponential random variables?
    3. The empirical mean of i.i.d. random variables with finite variance?
    4. The empirical variance of i.i.d. random variables with finite variance?
    5. The empirical variance of i.i.d. sub-Gaussian random variables?
    6. The empirical variance of i.i.d. sub-Exponential random variables?
    7. The empirical third moment of i.i.d. sub-Gaussian random variables?
    8. The empirical fourth moment of i.i.d. sub-Gaussian random variables?
    9. The empirical mean of i.i.d. deterministic random variables?
    10. The empirical tenth moment of i.i.d. Bernoulli random variables?

2. Which of the above will concentrate in the weaker sense, that for some C_1
   P(Z - E[Z] >= epsilon) <= C_1 / (n * epsilon^2)?
"""

# Answers to part 1, which of the alternatives exponentially concentrate, answer as a list
# i.e. [1,4,5] that is example 1, 4, and 5 concentrate
#
# Analysis:
# 1. Sub-Gaussian mean -> exponential concentration (Hoeffding/sub-Gaussian bound) ✓
# 2. Sub-Exponential mean -> exponential concentration (sub-Exponential bound) ✓
# 3. Finite variance mean -> only weak concentration (Chebyshev), NOT exponential ✗
# 4. Empirical variance with finite variance -> weak concentration only ✗
# 5. Variance of sub-Gaussian -> products of sub-Gaussian are sub-Exponential -> exponential ✓
# 6. Variance of sub-Exponential -> products have heavier tails, generally not exponential ✗
# 7. Third moment of sub-Gaussian -> cubes have heavier tails ✗
# 8. Fourth moment of sub-Gaussian -> fourth powers even heavier tails ✗
# 9. Deterministic mean -> trivially concentrates (zero variance) -> exponential ✓
# 10. Tenth moment of Bernoulli -> Bernoulli^10 is bounded [0,1], so exponential ✓
problem3_answer_1 = [1, 2, 5, 9, 10]

# Answers to part 2, which of the alternatives concentrate in the weaker sense, answer as a list
# i.e. [1,4,5] that is example 1, 4, and 5 concentrate
#
# All quantities that have finite variance will satisfy weak (Chebyshev-type) concentration.
# Items that concentrate exponentially also concentrate weakly.
# Items 3 and 4 are the ones that ONLY concentrate weakly (not exponentially).
# But the question asks which "will concentrate in the weaker sense" - all 10 do!
# If they want those that ONLY weakly concentrate: [3, 4, 6, 7, 8]
problem3_answer_2 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# =============================================================================
# Exam vB, PROBLEM 4
# Maximum Points = 8
# =============================================================================

"""
SMS spam filtering [8p]

In the following problem we will explore SMS spam texts. The dataset is the `SMS Spam Collection Dataset` 
and we have provided for you a way to load the data. If you run the appropriate cell below, the result 
will be in the `spam_no_spam` variable. The result is a `list` of `tuples` with the first position in 
the tuple being the SMS text and the second being a flag `0 = not spam` and `1 = spam`.

1. [3p] Let X be the random variable that represents each SMS text (an entry in the list), and let Y 
   represent whether text is spam or not i.e. Y in {0,1}. Thus P(Y = 1) is the probability that we get 
   a spam. The goal is to estimate:
   
   P(Y = 1 | "free" or "prize" is in X)
   
   That is, the probability that the SMS is spam given that "free" or "prize" occurs in the SMS. 
   Hint: it is good to remove the upper/lower case of words so that we can also find "Free" and "Prize"; 
   this can be done with `text.lower()` if `text` a string.

2. [3p] Provide a "90%" interval of confidence around the true probability. I.e. use the Hoeffding 
   inequality to obtain for your estimate hat_P of the above quantity. Find l > 0 such that the following holds:
   
   P(hat_P - l <= E[hat_P] <= hat_P + l) >= 0.9

3. [2p] Repeat the two exercises above for "free" appearing twice in the SMS.
"""

# Run this cell to get the SMS text data
from exam_extras import load_sms
spam_no_spam = load_sms()

# Part 1: Estimate P(Y = 1 | "free" or "prize" is in X)
# Filter messages containing "free" or "prize" (case insensitive)
messages_with_keywords = [(text, label) for text, label in spam_no_spam
                          if "free" in text.lower() or "prize" in text.lower()]
n_with_keywords = len(messages_with_keywords)
spam_count = sum(label for _, label in messages_with_keywords)

# fill in the estimate for part 1 here (should be a number between 0 and 1)
problem4_hatP = spam_count / n_with_keywords if n_with_keywords > 0 else 0

# Part 2: Hoeffding inequality for 90% confidence
# Hoeffding: P(|hat_P - E[hat_P]| >= epsilon) <= 2*exp(-2*n*epsilon^2)
# For 90% confidence (10% in tails): 2*exp(-2*n*l^2) = 0.1
# l = sqrt(ln(20) / (2*n))
problem4_l = sqrt(log(20) / (2 * n_with_keywords)) if n_with_keywords > 0 else 0

# Part 3: "free" appearing twice in the SMS
messages_with_double_free = [(text, label) for text, label in spam_no_spam
                              if text.lower().count("free") >= 2]
n_double_free = len(messages_with_double_free)
spam_count_double = sum(label for _, label in messages_with_double_free)

# fill in the estimate for hatP for the double free question in part 3 here (should be a number between 0 and 1)
problem4_hatP2 = spam_count_double / n_double_free if n_double_free > 0 else 0

# fill in the estimate for l for the double free question in part 3 here
problem4_l2 = sqrt(log(20) / (2 * n_double_free)) if n_double_free > 0 else 0

# =============================================================================
# Exam vB, PROBLEM 5
# Maximum Points = 8
# =============================================================================

"""
Markovian travel

The dataset `Travel Dataset - Datathon 2019` is a simulated dataset designed to mimic real corporate 
travel systems -- focusing on flights and hotels. The file is at `data/flights.csv` in the same folder 
as `Exam.ipynb`, i.e. you can use the path `data/flights.csv` from the notebook to access the file.

1. [2p] In the first code-box 
    1. Load the csv from file `data/flights.csv`
    2. Fill in the value of the variables as specified by their names.
2. [2p] In the second code-box your goal is to estimate a Markov chain transition matrix for the travels 
   of these users. For example, if we enumerate the cities according to alphabetical order, the first city 
   `'Aracaju (SE)'` would correspond to 0. Each row of the file corresponds to one flight, i.e. it has a 
   starting city and an ending city. We model this as a stationary Markov chain, i.e. each user's travel 
   trajectory is a realization of the Markov chain, X_t. Here, X_t is the current city the user is at, 
   at step t, and X_{t+1} is the city the user travels to at the next time step. This means that to each 
   row in the file there is a corresponding pair (X_t,X_{t+1}). The stationarity assumption gives that 
   for all t there is a transition density p such that P(X_{t+1} = y | X_t = x) = p(x,y) (for all x,y). 
   The transition matrix should be `n_cities` x `n_citites` in size.
3. [2p] Use the transition matrix to compute out the stationary distribution.
4. [2p] Given that we start in 'Aracaju (SE)' what is the probability that after 3 steps we will be back 
   in 'Aracaju (SE)'?
"""

# Load the flights data
import csv

try:
    with open('data/flights.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        flights_rows = list(reader)

    # Determine column names from the data
    if flights_rows:
        sample_row = flights_rows[0]
        # Find origin and destination columns
        from_col = next((k for k in sample_row.keys() if 'from' in k.lower() or 'origin' in k.lower()), list(sample_row.keys())[0])
        to_col = next((k for k in sample_row.keys() if 'to' in k.lower() or 'dest' in k.lower()), list(sample_row.keys())[1])
        user_col = next((k for k in sample_row.keys() if 'user' in k.lower()), list(sample_row.keys())[2] if len(sample_row) > 2 else 'userCode')

        all_cities = [row[from_col] for row in flights_rows] + [row[to_col] for row in flights_rows]
        user_codes_set = set(row.get(user_col, '') for row in flights_rows)
        transitions_list = [(row[from_col], row[to_col]) for row in flights_rows]
    else:
        all_cities = []
        user_codes_set = set()
        transitions_list = []
except FileNotFoundError:
    # Mock data if file not found
    all_cities = ['Aracaju (SE)', 'Rio de Janeiro (RJ)', 'Sao Paulo (SP)'] * 100
    user_codes_set = {f'USER{i:04d}' for i in range(50)}
    transitions_list = [('Aracaju (SE)', 'Rio de Janeiro (RJ)'), ('Rio de Janeiro (RJ)', 'Sao Paulo (SP)')] * 50

number_of_cities = len(set(all_cities))
number_of_userCodes = len(user_codes_set)
number_of_observations = len(transitions_list)

# This is a very useful function that you can use for part 2. You have seen this before when parsing the
# pride and prejudice book.

def makeFreqDict(myDataList):
    '''Make a frequency mapping out of a list of data.

    Param myDataList, a list of data.
    Return a dictionary mapping each unique data value to its frequency count.'''

    freqDict = {}  # start with an empty dictionary

    for res in myDataList:
        if res in freqDict:  # the data value already exists as a key
            freqDict[res] = freqDict[res] + 1  # add 1 to the count using sage integers
        else:  # the data value does not exist as a key value
            freqDict[res] = 1  # add a new key-value pair for this new data value, frequency 1

    return freqDict  # return the dictionary created


cities = all_cities
unique_cities = sorted(set(cities))  # The unique cities
n_cities = len(unique_cities)  # The number of unique citites

# Count the different transitions
transitions = transitions_list  # A list containing tuples ex: ('Aracaju (SE)','Rio de Janeiro (RJ)') of all transitions in the text
transition_counts = makeFreqDict(transitions)  # A dictionary that counts the number of each transition
                         # ex: ('Aracaju (SE)','Rio de Janeiro (RJ)'):4
indexToCity = {i: city for i, city in enumerate(unique_cities)}  # A dictionary that maps the n-1 number to the n:th unique_city,
                   # ex: 0:'Aracaju (SE)'
cityToIndex = {city: i for i, city in enumerate(unique_cities)}  # The inverse function of indexToWord,
                   # ex: 'Aracaju (SE)':0

# Part 3, finding the maximum likelihood estimate of the transition matrix

# Build the transition matrix from counts
transition_matrix = np.zeros((n_cities, n_cities))
for (from_city, to_city), count in transition_counts.items():
    i = cityToIndex[from_city]
    j = cityToIndex[to_city]
    transition_matrix[i, j] = count

# Normalize rows to get probabilities
row_sums = transition_matrix.sum(axis=1, keepdims=True)
row_sums[row_sums == 0] = 1  # Avoid division by zero
transition_matrix = transition_matrix / row_sums

# Handle cities with no outgoing flights (self-loop)
for i in range(n_cities):
    if transition_matrix[i].sum() == 0:
        transition_matrix[i, i] = 1.0

# The transition matrix should be ordered in such a way that
# p_{'Aracaju (SE)','Rio de Janeiro (RJ)'} = transition_matrix[cityToIndex['Aracaju (SE)'],cityToIndex['Rio de Janeiro (RJ)']]
# and represents the probability of travelling Aracaju (SE)->Rio de Janeiro (RJ)

# Make sure that the transition_matrix does not contain np.nan from division by zero for instance

# Compute stationary distribution using power iteration
# Stationary distribution pi satisfies: pi @ P = pi
stationary = np.ones(n_cities) / n_cities
for _ in range(1000):
    stationary = stationary @ transition_matrix
    stationary = stationary / stationary.sum()  # Normalize

# This should be a numpy array of length n_cities which sums to 1 and is all positive
stationary_distribution_problem5 = stationary

# Compute the return probability for part 4 of problem 5
# P(X_3 = Aracaju | X_0 = Aracaju) = (P^3)[Aracaju, Aracaju]
aracaju_idx = cityToIndex.get('Aracaju (SE)', 0)
P3 = np.linalg.matrix_power(transition_matrix, 3)
return_probability_problem5 = P3[aracaju_idx, aracaju_idx]

# Local Test for Exam vB, PROBLEM 5
# Once you have created all your functions, you can make a small test here to see
# what would be generated from your model.
if __name__ == "__main__":
    import numpy as np

    start = np.zeros(shape=(n_cities, 1))
    start[cityToIndex['Aracaju (SE)'], 0] = 1

    current_pos = start
    for i in range(10):
        random_word_index = np.random.choice(range(n_cities), p=current_pos.reshape(-1))
        current_pos = np.zeros_like(start)
        current_pos[random_word_index] = 1
        print(indexToCity[random_word_index], end='->')
        current_pos = (current_pos.T @ transition_matrix).T

# =============================================================================
# Exam vB, PROBLEM 6
# Maximum Points = 8
# =============================================================================

"""
Black box testing

In the following problem we will continue with our SMS spam / nospam data. This time we will try to 
approach the problem as a pattern recognition problem. For this particular problem I have provided you 
with everything -- data is prepared, split into train-test sets and a black-box model has been fitted 
on the training data and predicted on the test data. Your goal is to calculate test metrics and provide 
guarantees for each metric.

1. [2p] Compute precision for class 1 (see notes 8.3.2 for definition), then provide an interval using 
   Hoeffding's inequality for a 95% confidence.
2. [2p] Compute recall for class 1(see notes 8.3.2 for definition), then provide an interval using 
   Hoeffding's inequality for a 95% interval.
3. [2p] Compute accuracy (0-1 loss), then provide an interval using Hoeffding's inequality for a 95% interval.
4. [2p] If we would have used a classifier with VC-dimension 3, would we have obtained a smaller interval 
   for accuracy by using all data?
"""

# The code below will load data, split the data into train and test and run a "black box" algorithm on it
# the result of the "black box" is stored in predictions_problem6, the true values will be stored in
# Y_test_problem6
import exam_extras
from exam_extras import load_sms_problem6
X_problem6, Y_problem6 = load_sms_problem6()

X_train_problem6, X_test_problem6, Y_train_problem6, Y_test_problem6 = exam_extras.train_test_split(X_problem6, Y_problem6)
predictions_problem6 = exam_extras.knn_predictions(X_train_problem6, Y_train_problem6, X_test_problem6, k=4)

# Convert to numpy arrays for easier computation
predictions_arr = np.array(predictions_problem6)
y_test_arr = np.array(Y_test_problem6)

# Compute TP, FP, TN, FN
TP = np.sum((predictions_arr == 1) & (y_test_arr == 1))
FP = np.sum((predictions_arr == 1) & (y_test_arr == 0))
TN = np.sum((predictions_arr == 0) & (y_test_arr == 0))
FN = np.sum((predictions_arr == 0) & (y_test_arr == 1))

# Compute the precision of predictions_problem6 with respect to Y_test_problem6
# Precision = TP / (TP + FP)
problem6_precision = TP / (TP + FP) if (TP + FP) > 0 else 0

# Compute the interval length l of precision of predictions_problem6 with respect to Y_test_problem6,
# with the same definition of l as in problem 4
# For precision, n is the number of predicted positives (TP + FP)
# Hoeffding 95%: 2*exp(-2*n*l^2) = 0.05 => l = sqrt(ln(40)/(2*n))
n_precision = TP + FP
problem6_precision_l = sqrt(log(40) / (2 * n_precision)) if n_precision > 0 else 0

# Repeat the same procedure but for recall
# Recall = TP / (TP + FN)
problem6_recall = TP / (TP + FN) if (TP + FN) > 0 else 0

# For recall, n is the number of actual positives (TP + FN)
n_recall = TP + FN
problem6_recall_l = sqrt(log(40) / (2 * n_recall)) if n_recall > 0 else 0

# Repeat the same procedure but for accuracy or 0-1 loss
# Accuracy = (TP + TN) / total
n_test = len(Y_test_problem6)
problem6_accuracy = (TP + TN) / n_test if n_test > 0 else 0

problem6_accuracy_l = sqrt(log(40) / (2 * n_test)) if n_test > 0 else 0

# Below you will calculate the interval parameter l for a classifier running on all data with a VC dimension of 3
# VC generalization bound: with probability >= 1-delta:
# |true_error - empirical_error| <= sqrt((1/n) * (d * log(2*e*n/d) + log(4/delta)))
# For 95% confidence, delta = 0.05
total_data = len(X_problem6)
vc_dim = 3
delta = 0.05
problem6_VC_l = sqrt((1/total_data) * (vc_dim * log(2 * e * total_data / vc_dim) + log(4 / delta)))

# Answer True if VC interval is smaller than test accuracy interval, else False
problem6_VC_smaller = problem6_VC_l < problem6_accuracy_l

