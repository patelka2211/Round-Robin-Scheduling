import json

class round_robin:
    def __init__(self, nop, at, bt, tq):
        self.tq = tq
        self.nop = nop
        self.at = at
        self.bt = bt
        self.ready = []
        self.dictionary = []
        for index in range(self.nop):
            self.dictionary.append({
                "processid": f'P{index}',
                "at": self.at[index],
                "bt": self.bt[index],
                "completed": False
            })
        self.curr_t = 0
        self.completed_processes=0
        self.gantt=[]
        self.tt_n_wt=[]

    def update_ready(self):
        for item in range(len(self.dictionary)):
            if self.dictionary[item]['processid'] not in self.ready and not self.dictionary[item]['completed'] and self.dictionary[item]['at']<=self.curr_t:
                self.ready.append(self.dictionary[item]['processid'])

    def main(self):
        self.update_ready()
        while self.completed_processes!=self.nop:
            process = self.ready[0]
            index = int(process[1:])
            delta = min(self.dictionary[index]['bt'], self.tq)
            start_time = self.curr_t
            self.curr_t += delta
            end_time = self.curr_t

            if len(self.gantt)==0 or self.gantt[-1]['process']!=f'P{index+1}':
                self.gantt.append({'process':f'P{index+1}', 'start':start_time, 'end':end_time})
            elif self.gantt[-1]['process']==f'P{index+1}':
                self.gantt[-1]['end'] = end_time

            self.gantt[-1]['end'] = self.curr_t
            self.dictionary[index]['bt'] -= delta
            if self.dictionary[index]['bt']==0:
                self.dictionary[index]['completed']=True
                self.completed_processes+=1
                self.tt_n_wt.append({
                    'index': index,
                    'tt':self.curr_t-self.at[index],
                    'wt':self.curr_t-self.at[index]-self.bt[index]
                })

            self.update_ready()

            if not self.dictionary[index]['completed']:
                self.ready.append(self.ready.pop(0))
            if self.dictionary[index]['completed']:
                self.ready.pop(0)
        
        self.tt_n_wt.sort(key=lambda item: item['index'])
        avg_tt = 0
        avg_wt = 0
        for index in range(len(self.tt_n_wt)):
            avg_tt+=self.tt_n_wt[index]['tt']
            avg_wt+=self.tt_n_wt[index]['wt']
        
        avg_tt /= len(self.tt_n_wt)
        avg_wt /= len(self.tt_n_wt)

        self.tt_n_wt = {
            'tt_n_wt':self.tt_n_wt,
            'avg_tt':avg_tt,
            'avg_wt':avg_wt
        }

tq=2
nop = 6
at = [0,0,0,0,0,0]
bt = [4,5,2,1,6,3]

obj = round_robin(nop, at, bt, tq)

obj.main()
print(json.dumps(obj.gantt, indent=4))