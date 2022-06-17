class round_robin {
    constructor(nop, at, bt, tq) {
        this.tq = tq;
        this.nop = nop;
        this.at = at;
        this.bt = bt;
        this.ready = [];
        this.dictionary = [];

        for (let index = 0; index < this.nop; index += 1) {
            this.dictionary.push({
                processid: `P${index}`,
                at: this.at[index],
                bt: this.bt[index],
                completed: false,
            });
        }

        this.curr_t = 0;
        this.completed_processes = 0;
        this.gantt = [];
        this.tt_n_wt = [];
    }

    update_ready() {
        for (
            let item = 0; item < this.dictionary.length; item += 1
        ) {
            if (!this.ready.includes(this.dictionary[item].processid) &&
                !this.dictionary[item].completed &&
                this.dictionary[item].at <= this.curr_t
            ) {
                this.ready.push(this.dictionary[item].processid);
            }
        }
    }

    main() {
        let avg_tt, avg_wt, delta, index, process, start_time, end_time;
        this.update_ready();

        while (this.completed_processes !== this.nop) {
            process = this.ready[0];
            index = Number.parseInt(process.slice(1));
            delta = Math.min(this.dictionary[index].bt, this.tq);
            start_time = this.curr_t;
            this.curr_t += delta;
            end_time = this.curr_t;

            if (this.gantt.length === 0 || this.gantt.slice(-1)[0].process !== `P${index+1}`) {
                this.gantt.push({
                    process: `P${index+1}`,
                    start: start_time,
                    end: end_time
                });
            } else {
                if (this.gantt.slice(-1)[0].process === `P${index+1}`) {
                    this.gantt.slice(-1)[0].end = end_time;
                }
            }

            this.gantt.slice(-1)[0].end = this.curr_t;
            this.dictionary[index].bt -= delta;

            if (this.dictionary[index].bt === 0) {
                this.dictionary[index].completed = true;
                this.completed_processes += 1;
                this.tt_n_wt.push({
                    index: index,
                    tt: this.curr_t - this.at[index],
                    wt: this.curr_t - this.at[index] - this.bt[index],
                });
            }

            this.update_ready();

            if (!this.dictionary[index].completed) {
                this.ready.push(this.ready.shift());
            }

            if (this.dictionary[index].completed) {
                this.ready.shift();
            }
        }

        this.tt_n_wt.sort((index1, index2) => {
            return index1.index - index2.index;
        });

        avg_tt = 0;
        avg_wt = 0;

        for (let index = 0; index < this.tt_n_wt.length; index += 1) {
            avg_tt += this.tt_n_wt[index].tt;
            avg_wt += this.tt_n_wt[index].wt;
        }

        avg_tt /= this.tt_n_wt.length;
        avg_wt /= this.tt_n_wt.length;

        this.tt_n_wt = {
            tt_n_wt: this.tt_n_wt,
            avg_tt: avg_tt,
            avg_wt: avg_wt,
        };
    }
}


let tq = document.getElementById('tq');
let at = document.getElementById('at');
let bt = document.getElementById('bt');
let cont_btn = document.getElementById('continue_btn');
let at_list, bt_list;

function btn_disable(disable) {
    if (disable == true) {
        cont_btn.disabled = true;
        cont_btn.classList.add('disable');
    } else {
        cont_btn.disabled = false;
        cont_btn.classList.remove('disable');
    }
}


function validate() {
    if (tq.value == '' || at.value == '' || bt.value == '') {
        btn_disable(true);
        return
    } else {
        at_list = at.value.trim().split(',');
        for (let index = 0; index < at_list.length; index++) {
            at_list[index] = Number(at_list[index]);
        }
        bt_list = bt.value.trim().split(',');
        for (let index = 0; index < bt_list.length; index++) {
            bt_list[index] = Number(bt_list[index]);
        }
        if (Number(tq.value) > 0 && at_list.length == bt_list.length) {
            btn_disable(false);
        } else {
            btn_disable(true);
        }
    }
}

let gantt_chart = document.getElementById('gantt-chart');
let output_table = document.getElementById('output-table');
let avgtt = document.getElementById('avgtt');
let avgwt = document.getElementById('avgwt');
let output = document.getElementById('output');

cont_btn.addEventListener('click', function() {
    let obj = new round_robin(at_list.length, at_list, bt_list, Number(tq.value));
    obj.main();
    console.log(obj.gantt);
    console.log(obj.tt_n_wt);
    gantt_chart.innerHTML = '';
    for (index in obj.gantt) {
        gantt_chart.innerHTML += `<div class="time-period">
                                    <div class="boxes">
                                        <div class="box">${obj.gantt[index].process}</div>
                                    </div>
                                    <div class="times">
                                        <div class="time">${obj.gantt[index].start}</div>
                                        <div class="time">${obj.gantt[index].end}</div>
                                    </div>
                                </div>
                                `
    }
    output_table.innerHTML = `<tr>
                                    <th>processes</th>
                                    <th>turn around time</th>
                                    <th>waiting time</th>
                                </tr>`;
    for (index in obj.tt_n_wt.tt_n_wt) {
        output_table.innerHTML += `<tr>
                                        <td>
                                            P${obj.tt_n_wt.tt_n_wt[index].index+1}
                                        </td>
                                        <td>
                                            ${obj.tt_n_wt.tt_n_wt[index].tt} s
                                        </td>
                                        <td>
                                            ${obj.tt_n_wt.tt_n_wt[index].wt} s
                                        </td>
                                    </tr>`
    }
    console.log(obj.tt_n_wt);
    avgtt.innerText = `${obj.tt_n_wt.avg_tt}`;
    avgwt.innerText = `${obj.tt_n_wt.avg_wt}`;
    if (output.classList.contains('hide')) {
        output.classList.toggle('hide');
    }
})