from django.shortcuts import render, get_object_or_404
from django.db.models import Q
from django.core.paginator import Paginator
from .models import Article

def article_list(request):
    query = request.GET.get('q')

    if query:
        articles = Article.objects.filter(
            Q(title__icontains=query) | Q(content__icontains=query)
        ).order_by('-created_at')
    else:
        articles = Article.objects.all().order_by('-created_at')

    paginator = Paginator(articles, 6)
    page = request.GET.get('page')
    articles = paginator.get_page(page)

    return render(request, 'articles/list.html', {
        'articles': articles,
        'query': query
    })

def article_detail(request, id):
    article = get_object_or_404(Article, id=id)
    return render(request, 'articles/detail.html', {'article': article})