#accesory for filtering outliers
def findIQR(data):
    Q1 = np.percentile(data, 25, interpolation = 'midpoint')
    Q3 = np.percentile(data, 75, interpolation = 'midpoint')    
    IQR = Q3 - Q1
    
    print(IQR)

    return Q1,IQR,Q3
class outlier:
  lo = 0
  hi = 0

def getFilteredList(unFilteredData):    
    filteredList = []
    for items in unFilteredData:
        if(items > (Q1 + 1.5*IQR) and (items < (Q3 + 1.5*IQR))):
            filteredList.append(items)
        elif(items<(Q1 + 1.5*IQR)):
            outlier.lo += 1
        else:
            outlier.hi += 1
    return filteredList

filteredList = getFilteredList(serviceTime)
print("filtered bhako length", len(filteredList))


Q1,IQR,Q3 = findIQR(serviceTime)
print("Q1:",Q1,"IQR",IQR,"Q3",Q3)