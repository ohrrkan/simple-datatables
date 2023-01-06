import {createElement} from "./helpers"
/**
 * Rows API
 */
export class Rows {
    constructor(dt) {
        this.dt = dt

        this.cursor = false
    }

    /**
     * Build a new row
     */
    build(row) {
        const tr = createElement("tr")

        let headings = this.dt.headings

        if (!headings.length) {
            headings = row.map(() => "")
        }

        headings.forEach((h, i) => {
            const td = createElement("td")

            // Fixes #29
            if (!row[i] || !row[i].length) {
                row[i] = ""
            }

            td.innerHTML = row[i]

            td.data = row[i]

            tr.appendChild(td)
        })

        return tr
    }

    setCursor(row=false) {
        let oldCursor
        Array.from(this.dt.dom.rows).forEach(row => {
            oldCursor = row
            row.classList.remove("dataTable-cursor")
        })
        if (row) {
            row.classList.add("dataTable-cursor")
            this.cursor = row
            if (this.dt.options.scrollY) {
                this.cursor.scrollIntoView({block: "nearest"})
            }
            this.dt.emit("datatable.cursormove", this.cursor, oldCursor)
        }
    }

    render(row) {
        return row
    }

    /**
     * Add new row
     */
    add(data) {
        if (Array.isArray(data)) {
            const dt = this.dt
            // Check for multiple rows
            if (Array.isArray(data[0])) {
                data.forEach(row => {
                    dt.rowData.push(this.build(row))
                })
            } else {
                dt.rowData.push(this.build(data))
            }

            // We may have added data to an empty table
            if ( dt.rowData.length ) {
                dt.hasRows = true
            }


            this.update()

            dt.columns.rebuild()
        }

    }

    /**
     * Remove row(s)
     */
    remove(select) {
        const dt = this.dt

        if (Array.isArray(select)) {
            // Remove in reverse otherwise the indexes will be incorrect
            select.sort((a, b) => b - a)

            select.forEach(row => {
                dt.rowData.splice(row, 1)
            })
        } else if (select == "all") {
            dt.rowData = []
        } else {
            dt.rowData.splice(select, 1)
        }

        // We may have emptied the table
        if ( !dt.rowData.length ) {
            dt.hasRows = false
        }

        this.update()
        dt.columns.rebuild()
    }

    /**
     * Update row indexes
     * @return {Void}
     */
    update() {
        this.dt.rowData.forEach((row, i) => {
            row.dataIndex = i
        })
    }

    /**
     * Find index of row by searching for a value in a column
     */
    findRowIndex(columnIndex, value) {
        // returns row index of first case-insensitive string match
        // inside the td innerText at specific column index
        return this.dt.rowData.findIndex(
            tr => tr.children[columnIndex].innerText.toLowerCase().includes(String(value).toLowerCase())
        )
    }

    /**
     * Find index, row, and column data by searching for a value in a column
     */
    findRow(columnIndex, value) {
        // get the row index
        const index = this.findRowIndex(columnIndex, value)
        // exit if not found
        if (index < 0) {
            return {
                index: -1,
                row: null,
                cols: []
            }
        }
        // get the row from data
        const row = this.dt.rowData[index]
        // return innerHTML of each td
        const cols = [...row.cells].map(r => r.innerHTML)
        // return everything
        return {
            index,
            row,
            cols
        }
    }

    /**
     * Update a row with new data
     */
    updateRow(select, data) {
        const row = this.build(data)
        this.dt.rowData.splice(select, 1, row)
        this.update()
        this.dt.columns.rebuild()
    }
}
