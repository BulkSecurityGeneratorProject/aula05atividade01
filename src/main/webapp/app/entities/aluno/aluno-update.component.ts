import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JhiAlertService } from 'ng-jhipster';

import { IAluno } from 'app/shared/model/aluno.model';
import { AlunoService } from './aluno.service';
import { IPessoa } from 'app/shared/model/pessoa.model';
import { PessoaService } from 'app/entities/pessoa';
import { INota } from 'app/shared/model/nota.model';
import { NotaService } from 'app/entities/nota';
import { IFalta } from 'app/shared/model/falta.model';
import { FaltaService } from 'app/entities/falta';

@Component({
    selector: 'jhi-aluno-update',
    templateUrl: './aluno-update.component.html'
})
export class AlunoUpdateComponent implements OnInit {
    aluno: IAluno;
    isSaving: boolean;

    pessoas: IPessoa[];

    notas: INota[];

    faltas: IFalta[];

    constructor(
        protected jhiAlertService: JhiAlertService,
        protected alunoService: AlunoService,
        protected pessoaService: PessoaService,
        protected notaService: NotaService,
        protected faltaService: FaltaService,
        protected activatedRoute: ActivatedRoute
    ) {}

    ngOnInit() {
        this.isSaving = false;
        this.activatedRoute.data.subscribe(({ aluno }) => {
            this.aluno = aluno;
        });
        this.pessoaService.query({ filter: 'aluno-is-null' }).subscribe(
            (res: HttpResponse<IPessoa[]>) => {
                if (!this.aluno.pessoa || !this.aluno.pessoa.id) {
                    this.pessoas = res.body;
                } else {
                    this.pessoaService.find(this.aluno.pessoa.id).subscribe(
                        (subRes: HttpResponse<IPessoa>) => {
                            this.pessoas = [subRes.body].concat(res.body);
                        },
                        (subRes: HttpErrorResponse) => this.onError(subRes.message)
                    );
                }
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
        this.notaService.query().subscribe(
            (res: HttpResponse<INota[]>) => {
                this.notas = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
        this.faltaService.query().subscribe(
            (res: HttpResponse<IFalta[]>) => {
                this.faltas = res.body;
            },
            (res: HttpErrorResponse) => this.onError(res.message)
        );
    }

    previousState() {
        window.history.back();
    }

    save() {
        this.isSaving = true;
        if (this.aluno.id !== undefined) {
            this.subscribeToSaveResponse(this.alunoService.update(this.aluno));
        } else {
            this.subscribeToSaveResponse(this.alunoService.create(this.aluno));
        }
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<IAluno>>) {
        result.subscribe((res: HttpResponse<IAluno>) => this.onSaveSuccess(), (res: HttpErrorResponse) => this.onSaveError());
    }

    protected onSaveSuccess() {
        this.isSaving = false;
        this.previousState();
    }

    protected onSaveError() {
        this.isSaving = false;
    }

    protected onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }

    trackPessoaById(index: number, item: IPessoa) {
        return item.id;
    }

    trackNotaById(index: number, item: INota) {
        return item.id;
    }

    trackFaltaById(index: number, item: IFalta) {
        return item.id;
    }
}
