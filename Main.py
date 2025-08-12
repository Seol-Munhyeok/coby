n = input()
lst = []

for i in range(len(n)):
    lst.append(int(n[i]))

lst.sort(reverse=True)
for num in range(len(n)):
    print(lst[num], end='')