from django.urls import path
from . import views

urlpatterns = [
    path('', views.article_list, name='list'),
    path('article/<int:id>/', views.article_detail, name='detail'),
]